import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../contexts/AuthContext';
import { getRecruiterJobs } from '../../api/job';
import { useFocusEffect } from '@react-navigation/native';

const JobsScreen = ({ navigation }) => {
    const { userToken, userInfo } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchJobs = async () => {
        try {
            setError(null);
            const response = await getRecruiterJobs(userToken, userInfo?.id);
            if (response && response.results) {
                // console.log('Jobs:', response.results);
                setJobs(response.results);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Không thể tải danh sách tin tuyển dụng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Sử dụng useFocusEffect thay vì useEffect
    useFocusEffect(
        React.useCallback(() => {
            fetchJobs();
            return () => {
                // Cleanup nếu cần
            };
        }, [userToken, userInfo?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const Header = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <TouchableOpacity
                    onPress={() => navigation.openDrawer()}
                    style={styles.menuButton}
                >
                    <Ionicons name="menu" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.welcomeText}>Xin chào!</Text>
                    <Text style={styles.recruiterName}>{userInfo?.company_name || 'Recruiter'}</Text>
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
        </View>
    );

    const StatisticsSection = () => {
        const stats = [
            {
                number: jobs.length || 0,
                label: 'Tổng tin',
                color: '#004aad',
                borderColor: '#004aad'
            },
            {
                number: jobs.filter(job => job.status === 'Approved').length,
                label: 'Đang\ntuyển',
                color: '#28a745',
                borderColor: '#28a745'
            },
            {
                number: jobs.filter(job => job.status === 'Pending').length,
                label: 'Chờ\nduyệt',
                color: '#ffc107',
                borderColor: '#ffc107'
            },
            {
                number: jobs.filter(job => job.status === 'Draft').length,
                label: 'Bản\nnháp',
                color: '#6c757d',
                borderColor: '#6c757d'
            }
        ];

        return (
            <View style={styles.statsSection}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.statsTitle}>Tin tuyển dụng ({jobs.length})</Text>
                        <Text style={styles.statsSubtitle}>Quản lý tin tuyển dụng</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreateJob')}
                    >
                        <Ionicons name="add-circle-outline" size={16} color="#fff" />
                        <Text style={styles.createButtonText}>Tạo tin mới</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View
                            key={index}
                            style={[
                                styles.statItem,
                                { borderLeftColor: stat.borderColor }
                            ]}
                        >
                            <Text style={[styles.statNumber, { color: stat.color }]}>
                                {stat.number}
                            </Text>
                            <Text style={styles.statLabel}>
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const JobCard = ({ job }) => {
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        };

        const getStatusColor = (status) => {
            switch (status) {
                case 'Approved': return { bg: '#e6f7ee', text: '#28a745', border: '#28a745' };
                case 'Pending': return { bg: '#fff8e6', text: '#ffc107', border: '#ffc107' };
                case 'Draft': return { bg: '#f0f0f0', text: '#6c757d', border: '#6c757d' };
                case 'Rejected': return { bg: '#ffebee', text: '#dc3545', border: '#dc3545' };
                default: return { bg: '#f0f0f0', text: '#6c757d', border: '#6c757d' };
            }
        };

        const getStatusText = (status) => {
            switch (status) {
                case 'Approved': return 'Đang tuyển';
                case 'Pending': return 'Chờ duyệt';
                case 'Draft': return 'Bản nháp';
                case 'Rejected': return 'Bị từ chối';
                default: return 'Không xác định';
            }
        };

        const statusStyle = getStatusColor(job.status);

        return (
            <TouchableOpacity
                style={styles.jobCard}
                onPress={() => navigation.navigate('JobDetail', { slug: job.slug })}
            >
                <View style={styles.jobCardHeader}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {getStatusText(job.status)}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.companyInfo}>
                    <Ionicons name="business-outline" size={16} color="#666" />
                    <Text style={styles.companyText}>{job.company_name || userInfo?.company_name || 'Công ty'}</Text>
                </View>
                
                <View style={styles.jobInfo}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>{job.location || 'Không xác định'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>{job.job_type || 'Toàn thời gian'}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="cash-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                {job.salary_min && job.salary_max ? 
                                    `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} VNĐ` : 
                                    'Thỏa thuận'}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="people-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>{job.applications_count || 0} ứng viên</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.jobTags}>
                    {job.skills && job.skills.slice(0, 3).map((skill, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text style={styles.tagText}>{skill}</Text>
                        </View>
                    ))}
                </View>
                
                <View style={styles.cardFooter}>
                    <View style={styles.viewsContainer}>
                        <Ionicons name="eye-outline" size={16} color="#666" />
                        <Text style={styles.viewsText}>{job.views_count || 0} lượt xem</Text>
                    </View>
                    {job.expiration_date && (
                        <View style={styles.expirationContainer}>
                            <Ionicons name="calendar-outline" size={16} color="#666" />
                            <Text style={styles.expirationText}>
                                Hết hạn: {formatDate(job.expiration_date)}
                            </Text>
                        </View>
                    )}
                </View>
                
                {/* <View style={styles.cardActions}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('JobDetail', { slug: job.slug })}
                    >
                        <Ionicons name="eye-outline" size={16} color="#004aad" />
                        <Text style={styles.actionText}>Chi tiết</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('EditJob', { slug: job.slug })}
                    >
                        <Ionicons name="create-outline" size={16} color="#004aad" />
                        <Text style={styles.actionText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                </View> */}
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004aad" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header />
            <FlatList
                data={jobs}
                renderItem={({ item }) => <JobCard job={item} />}
                keyExtractor={item => item.id.toString()}
                ListHeaderComponent={<StatisticsSection />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                            {error || 'Chưa có tin tuyển dụng nào'}
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('CreateJob')}
                        >
                            <Text style={styles.emptyButtonText}>Tạo tin tuyển dụng</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
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
        paddingTop: 48,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuButton: {
        padding: 4,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statsSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#004aad',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    createButtonText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 13,
        fontWeight: '500',
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 14,
    },
    jobCard: {
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
    jobCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    companyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    companyText: {
        marginLeft: 8,
        color: '#666',
        fontSize: 14,
    },
    jobInfo: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoText: {
        marginLeft: 8,
        color: '#666',
        fontSize: 14,
    },
    jobTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tagItem: {
        backgroundColor: '#e6f2ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: '#004aad',
        fontSize: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginBottom: 12,
    },
    viewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewsText: {
        marginLeft: 4,
        color: '#666',
        fontSize: 12,
    },
    expirationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expirationText: {
        marginLeft: 4,
        color: '#666',
        fontSize: 12,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    actionText: {
        marginLeft: 4,
        color: '#004aad',
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingBottom: 16,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginTop: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyButton: {
        backgroundColor: '#004aad',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
});

export default JobsScreen;