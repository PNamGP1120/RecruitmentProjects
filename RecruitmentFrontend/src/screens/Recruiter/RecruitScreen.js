// src/screens/Recruiter/RecruitScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { 
    getRecruiterApplications, 
    getRecruiterStats, 
    rejectApplication,
    createInterview
} from '../../api/recruiter';
import { Chip, Badge, Portal, Dialog, Button, Surface } from 'react-native-paper';

const { width } = Dimensions.get('window');

const RecruitScreen = ({ navigation }) => {
    const { userToken, userInfo } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        reviewed: 0,
        interviewed: 0,
        hired: 0
    });
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [interviewDialogVisible, setInterviewDialogVisible] = useState(false);
    const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
    const [error, setError] = useState(null);

    // Fetch data
    const fetchData = useCallback(async () => {
        if (!userToken || !userInfo) return;
        
        try {
            setLoading(true);
            setError(null);
            
            // Fetch recruiter stats
            const statsData = await getRecruiterStats(userToken);
            if (statsData) {
                setStats({
                    pending: statsData.pending_applications || 0,
                    reviewed: statsData.reviewed_applications || 0,
                    interviewed: statsData.interviewed_applications || 0,
                    hired: statsData.hired_applications || 0
                });
            }
            
            // Fetch recruiter applications
            const allApplications = await getRecruiterApplications(userToken);
            if (allApplications) {
                setApplications(allApplications);
                setFilteredApplications(allApplications);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userToken, userInfo]);

    // Initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    // Handle search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredApplications(applications);
        } else {
            const filtered = applications.filter(app => 
                app.job_seeker?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.job_posting_title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredApplications(filtered);
        }
    }, [searchQuery, applications]);

    // Handle filter
    useEffect(() => {
        if (selectedFilter === 'all') {
            setFilteredApplications(applications);
        } else {
            const filtered = applications.filter(app => {
                switch(selectedFilter) {
                    case 'pending': return app.status === 'Applied';
                    case 'reviewed': return app.status === 'Reviewed';
                    case 'interviewed': return app.status === 'Interview Scheduled';
                    case 'hired': return app.status === 'Hired';
                    default: return true;
                }
            });
            setFilteredApplications(filtered);
        }
    }, [selectedFilter, applications]);

    // Handle reject application
    const handleRejectApplication = async () => {
        if (!selectedApplication) return;
        
        try {
            setLoading(true);
            await rejectApplication(userToken, selectedApplication.id);
            setRejectDialogVisible(false);
            setSelectedApplication(null);
            // Refresh data
            fetchData();
        } catch (err) {
            console.error('Error rejecting application:', err);
            setError('Không thể từ chối đơn ứng tuyển. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Handle schedule interview
    const handleScheduleInterview = () => {
        if (!selectedApplication) return;
        
        // Navigate to interview scheduling screen with application data
        navigation.navigate('ScheduleInterview', { 
            applicationId: selectedApplication.id,
            jobSeekerId: selectedApplication.job_seeker.id,
            jobPostingId: selectedApplication.job_posting_detail.id
        });
        
        setInterviewDialogVisible(false);
        setSelectedApplication(null);
    };

    // Header Component
    const Header = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.welcomeText}>Xin chào!</Text>
                    <Text style={styles.recruiterName}>{userInfo?.username || 'Recruiter'}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    {userInfo?.avatar_url ? (
                        <Image
                            source={{ uri: userInfo.avatar_url }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person-circle" size={32} color="#004aad" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm ứng viên, việc làm..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    // Stats Component
    const StatisticsSection = () => {
        const stats = [
            {
                number: filteredApplications.filter(app => app.status === 'Applied').length,
                label: 'Chờ\nxử lý',
                color: '#FFC107',
                borderColor: '#FFC107'
            },
            {
                number: filteredApplications.filter(app => app.status === 'Reviewed').length,
                label: 'Đã\nxem',
                color: '#2196F3',
                borderColor: '#2196F3'
            },
            {
                number: filteredApplications.filter(app => app.status === 'Interview Scheduled').length,
                label: 'Đã lên\nlịch PV',
                color: '#9C27B0',
                borderColor: '#9C27B0'
            },
            {
                number: filteredApplications.filter(app => app.status === 'Hired').length,
                label: 'Đã\ntuyển',
                color: '#4CAF50',
                borderColor: '#4CAF50'
            }
        ];

        return (
            <View style={styles.statsSection}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.statsTitle}>Đơn ứng tuyển ({filteredApplications.length})</Text>
                        <Text style={styles.statsSubtitle}>Quản lý đơn ứng tuyển</Text>
                    </View>
                </View>
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.statItem,
                                { borderLeftColor: stat.borderColor }
                            ]}
                            onPress={() => {
                                switch(index) {
                                    case 0: setSelectedFilter('pending'); break;
                                    case 1: setSelectedFilter('reviewed'); break;
                                    case 2: setSelectedFilter('interviewed'); break;
                                    case 3: setSelectedFilter('hired'); break;
                                    default: setSelectedFilter('all');
                                }
                            }}
                        >
                            <Text style={[styles.statNumber, { color: stat.color }]}>
                                {stat.number}
                            </Text>
                            <Text style={styles.statLabel}>
                                {stat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    // Application Card
    const ApplicationCard = ({ item }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'Applied': return '#FFC107';
                case 'Reviewed': return '#2196F3';
                case 'Interview Scheduled': return '#9C27B0';
                case 'Hired': return '#4CAF50';
                case 'Rejected': return '#F44336';
                default: return '#9E9E9E';
            }
        };

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        };

        return (
            <TouchableOpacity
                style={styles.applicationCard}
                onPress={() => navigation.navigate('ApplicationDetail', { application: item })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.applicantInfo}>
                        <Image 
                            source={{ uri: item.job_seeker.avatar_url || 'https://via.placeholder.com/150' }}
                            style={styles.avatarImage}
                        />
                        <View style={styles.nameContainer}>
                            <Text style={styles.applicantName}>
                                {item.job_seeker.first_name || item.job_seeker.username} {item.job_seeker.last_name || ''}
                            </Text>
                            <Text style={styles.jobTitle}>{item.job_posting_title}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status_display}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            {formatDate(item.applied_at)}
                        </Text>
                    </View>

                    {item.status === 'Applied' && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => {
                                    setSelectedApplication(item);
                                    setInterviewDialogVisible(true);
                                }}
                            >
                                <Ionicons name="calendar" size={16} color="#2196F3" />
                                <Text style={[styles.actionButtonText, {color: '#2196F3'}]}>Phỏng vấn</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => {
                                    setSelectedApplication(item);
                                    setRejectDialogVisible(true);
                                }}
                            >
                                <Ionicons name="close-circle" size={16} color="#F44336" />
                                <Text style={[styles.actionButtonText, {color: '#F44336'}]}>Từ chối</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Empty state
    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>
                {error ? error : 'Không có đơn ứng tuyển nào'}
            </Text>
            {error && (
                <Button 
                    mode="contained" 
                    onPress={onRefresh}
                    style={styles.retryButton}
                >
                    Thử lại
                </Button>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header />
            <FlatList
                data={filteredApplications}
                renderItem={({ item }) => <ApplicationCard item={item} />}
                keyExtractor={item => item.id.toString()}
                ListHeaderComponent={<StatisticsSection />}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={["#2196F3"]} 
                    />
                }
                ListEmptyComponent={<EmptyState />}
            />

            {/* Interview Dialog */}
            <Portal>
                <Dialog
                    visible={interviewDialogVisible}
                    onDismiss={() => setInterviewDialogVisible(false)}
                >
                    <Dialog.Title>Lên lịch phỏng vấn</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Bạn muốn lên lịch phỏng vấn với ứng viên này?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setInterviewDialogVisible(false)}>Hủy</Button>
                        <Button onPress={handleScheduleInterview}>Tiếp tục</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Reject Dialog */}
            <Portal>
                <Dialog
                    visible={rejectDialogVisible}
                    onDismiss={() => setRejectDialogVisible(false)}
                >
                    <Dialog.Title>Từ chối đơn ứng tuyển</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Bạn có chắc chắn muốn từ chối đơn ứng tuyển này?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setRejectDialogVisible(false)}>Hủy</Button>
                        <Button textColor="#F44336" onPress={handleRejectApplication}>Từ chối</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitle: {
        flex: 1,
        marginLeft: 12,
    },
    welcomeText: {
        fontSize: 14,
        color: '#666',
    },
    recruiterName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: '#333',
        fontSize: 14,
    },
    statsSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statsSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    statItem: {
        flex: 1,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 3,
        backgroundColor: '#fff',
        marginHorizontal: 4,
        paddingVertical: 8,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 14,
    },
    applicationCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    applicantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    nameContainer: {
        marginLeft: 12,
        flex: 1,
    },
    applicantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    jobTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        marginLeft: 6,
        color: '#666',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 8,
    },
    actionButtonText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    listContainer: {
        paddingBottom: 16,
    },
    emptyContainer: {
        padding: 16,
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginTop: 8,
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#2196F3',
    },
});

export default RecruitScreen;