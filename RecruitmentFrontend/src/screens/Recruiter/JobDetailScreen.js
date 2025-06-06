import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../contexts/AuthContext';
import { getJobDetails, submitJobForApproval, deleteJob } from '../../api/job';

const JobDetailScreen = ({ route, navigation }) => {
    const { slug } = route.params;
    const { userToken } = useContext(AuthContext);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchJobDetails = async () => {
        try {
            const response = await getJobDetails(userToken, slug);
            setJob(response);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin tin tuyển dụng');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobDetails();
    }, [slug]);

    const handleSubmitForApproval = async () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn gửi tin tuyển dụng này để duyệt?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Gửi',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await submitJobForApproval(userToken, slug);
                            await fetchJobDetails();
                            
                            Alert.alert(
                                'Thành công', 
                                'Đã gửi tin tuyển dụng để duyệt',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            // Quay lại màn hình trước đó sau khi submit thành công
                                            navigation.goBack();
                                        }
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('Submit error:', error);
                            Alert.alert('Lỗi', 'Không thể gửi tin tuyển dụng để duyệt');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa tin tuyển dụng này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteJob(userToken, slug);
                            Alert.alert('Thành công', 'Đã xóa tin tuyển dụng');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa tin tuyển dụng');
                        }
                    }
                }
            ]
        );
    };

    const Header = () => (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
                {job?.status === 'Draft' && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.submitButton]}
                        onPress={handleSubmitForApproval}
                    >
                        <Ionicons name="paper-plane-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Gửi duyệt</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => navigation.navigate('EditJob', { slug: job.slug })}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const StatusBadge = ({ status }) => {
        const getStatusColor = () => {
            switch (status) {
                case 'Approved': return '#28a745';
                case 'Pending': return '#ffc107';
                case 'Draft': return '#6c757d';
                case 'Rejected': return '#dc3545';
                default: return '#6c757d';
            }
        };

        return (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{status}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004aad" />
            </View>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header />
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{job.title}</Text>
                        <StatusBadge status={job.status} />
                    </View>
                    <View style={styles.companyInfo}>
                        <Ionicons name="business-outline" size={20} color="#666" />
                        <Text style={styles.companyName}>{job.company_name}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>{job.location}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>{job.job_type}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="cash-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>
                                ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>
                                Hết hạn: {formatDate(job.expiration_date)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mô tả công việc</Text>
                    <Text style={styles.description}>{job.description}</Text>
                </View>

                {job.requirements && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Yêu cầu</Text>
                        <Text style={styles.description}>{job.requirements}</Text>
                    </View>
                )}

                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={24} color="#004aad" />
                        <Text style={styles.statNumber}>{job.views_count || 0}</Text>
                        <Text style={styles.statLabel}>Lượt xem</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="people-outline" size={24} color="#28a745" />
                        <Text style={styles.statNumber}>{job.applications_count || 0}</Text>
                        <Text style={styles.statLabel}>Ứng tuyển</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="bookmark-outline" size={24} color="#ffc107" />
                        <Text style={styles.statNumber}>{job.saves_count || 0}</Text>
                        <Text style={styles.statLabel}>Lưu tin</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    submitButton: {
        backgroundColor: '#004aad',
    },
    editButton: {
        backgroundColor: '#28a745',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    companyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    companyName: {
        fontSize: 16,
        color: '#666',
    },
    infoGrid: {
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 15,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    statsSection: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default JobDetailScreen;