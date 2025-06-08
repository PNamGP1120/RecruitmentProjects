import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    Dimensions,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const MOCK_DATA = {
    stats: [
        { label: 'Đang tuyển', count: 12, color: '#4CAF50', icon: 'checkmark-circle' },
        { label: 'Chờ duyệt', count: 5, color: '#FFC107', icon: 'time' },
        { label: 'Nháp', count: 5, color: '#9E9E9E', icon: 'document-text' },
        { label: 'Hết hạn', count: 3, color: '#F44336', icon: 'close-circle' }
    ],
    jobs: [
        {
            id: 1,
            title: 'Senior Frontend Developer',
            salary: '$1500 - $2500',
            location: 'Ho Chi Minh City',
            type: 'Full-time',
            status: 'active',
            applications: 12,
            views: 245,
            deadline: '2024-04-30',
            created_at: '2024-03-15',
            skills: ['React', 'TypeScript', 'Node.js']
        },
        {
            id: 2,
            title: 'Backend Developer',
            salary: '$1200 - $2000',
            location: 'Ha Noi',
            type: 'Full-time',
            status: 'pending',
            applications: 8,
            views: 180,
            deadline: '2024-04-25',
            created_at: '2024-03-10',
            skills: ['Python', 'Django', 'PostgreSQL']
        }
    ]
};

const RecruitScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const HeaderComponent = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#fff" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm tin tuyển dụng..."
                    placeholderTextColor="#E3F2FD"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    const StatsComponent = () => (
        <View style={styles.statsContainer}>
            {MOCK_DATA.stats.map((stat, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.statCard, { borderLeftColor: stat.color }]}
                    onPress={() => setSelectedFilter(stat.label.toLowerCase())}
                >
                    <View style={styles.statIconContainer}>
                        <Ionicons name={stat.icon} size={24} color={stat.color} />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statCount}>{stat.count}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const JobCard = ({ item }) => (
        <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
        >
            <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <View style={styles.jobInfo}>
                <View style={styles.infoItem}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.salary}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{item.location}</Text>
                </View>
            </View>

            <View style={styles.jobStats}>
                <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={16} color="#666" />
                    <Text style={styles.statText}>{item.views} lượt xem</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.statText}>{item.applications} ứng viên</Text>
                </View>
            </View>

            <View style={styles.skillsContainer}>
                {item.skills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'pending': return '#FFC107';
            case 'draft': return '#9E9E9E';
            case 'expired': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Đang tuyển';
            case 'pending': return 'Chờ duyệt';
            case 'draft': return 'Nháp';
            case 'expired': return 'Hết hạn';
            default: return 'Không xác định';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <HeaderComponent />
            
            <FlatList
                data={MOCK_DATA.jobs}
                renderItem={({ item }) => <JobCard item={item} />}
                keyExtractor={item => item.id.toString()}
                ListHeaderComponent={StatsComponent}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    setTimeout(() => setRefreshing(false), 1000);
                }}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateJob')}
            >
                <View style={styles.fabButton}>
                    <Ionicons name="add" size={24} color="#fff" />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        height: 120,
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 45,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 15,
        justifyContent: 'space-between',
    },
    statCard: {
        width: (width - 50) / 2,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconContainer: {
        marginRight: 10,
    },
    statInfo: {
        flex: 1,
    },
    statCount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    listContainer: {
        padding: 15,
    },
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    jobInfo: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    infoText: {
        marginLeft: 5,
        color: '#666',
        fontSize: 14,
    },
    jobStats: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    statText: {
        marginLeft: 5,
        color: '#666',
        fontSize: 14,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    skillBadge: {
        backgroundColor: '#E3F2FD',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 8,
    },
    skillText: {
        color: '#2196F3',
        fontSize: 12,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
});

export default RecruitScreen;