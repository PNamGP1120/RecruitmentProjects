// src/screens/Recruiter/ApplicationDetail.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Linking,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Surface, Divider, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { rejectApplication, createInterview, getInterviews, offerApplication } from '../../api/recruiter';
import { apiRequest } from '../../api/request';
import { createConversation } from '../../api/firebaseService';

const ApplicationDetail = ({ route, navigation }) => {
    const { application } = route.params;
    const { userToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingInterview, setFetchingInterview] = useState(false);
    const [error, setError] = useState(null);
    const [interviewDialogVisible, setInterviewDialogVisible] = useState(false);
    const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
    const [offerDialogVisible, setOfferDialogVisible] = useState(false);
    const [interviewData, setInterviewData] = useState(null);
    const [refreshedApplication, setRefreshedApplication] = useState(application);

    // Fetch application data to ensure we have the latest status
    const fetchApplicationData = async () => {
        try {
            const response = await apiRequest(`/applications/${application.id}/`, 'GET', userToken);
            if (response) {
                setRefreshedApplication(response);

                // If status is Interview Scheduled, fetch interview data
                if (response.status === 'Interview Scheduled') {
                    fetchInterviewData();
                }
            }
        } catch (err) {
            console.error('Error fetching application data:', err);
        }
    };

    // Fetch interview data if application status is "Interview Scheduled"
    const fetchInterviewData = async () => {
        try {
            setFetchingInterview(true);
            // Gọi API để lấy danh sách phỏng vấn của đơn ứng tuyển
            const response = await getInterviews(userToken, { application: application.id });
            console.log("API Response:", response);

            // Kiểm tra cấu trúc dữ liệu API và lấy mảng results
            const interviews = response && response.results ? response.results : [];

            // Kiểm tra xem có phỏng vấn nào không
            if (interviews && interviews.length > 0) {
                // Lọc ra các phỏng vấn có location hợp lệ
                const validInterviews = interviews.filter(interview => interview.location);

                if (validInterviews.length > 0) {
                    // Sắp xếp theo thời gian tạo mới nhất
                    const sortedInterviews = validInterviews.sort((a, b) =>
                        new Date(b.created_at) - new Date(a.created_at)
                    );

                    // Lấy phỏng vấn mới nhất có location
                    const latestInterview = sortedInterviews[0];
                    setInterviewData(latestInterview);
                    console.log("Link phòng phỏng vấn:", latestInterview.location);
                } else {
                    console.log("Không tìm thấy phỏng vấn có link hợp lệ");
                    setInterviewData(null);
                }
            } else {
                console.log("Không tìm thấy phỏng vấn nào");
                setInterviewData(null);
            }
        } catch (err) {
            console.error('Error fetching interview data:', err);
            setError('Không thể tải thông tin phỏng vấn');
        } finally {
            setFetchingInterview(false);
        }
    };

    // Gọi hàm này khi màn hình được mở
    useEffect(() => {
        fetchApplicationData();
    }, [application.id]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return '#FFC107';
            case 'Reviewed': return '#2196F3';
            case 'Interview Scheduled': return '#9C27B0';
            case 'Hired': return '#4CAF50';
            case 'Rejected': return '#F44336';
            case 'Offered': return '#FF9800';
            default: return '#9E9E9E';
        }
    };

    // Handle reject application
    const handleReject = async () => {
        try {
            setLoading(true);
            // Gọi API để từ chối đơn ứng tuyển
            await rejectApplication(userToken, refreshedApplication.id);
            Alert.alert(
                'Thành công',
                'Đã từ chối đơn ứng tuyển',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (err) {
            console.error('Error rejecting application:', err);
            setError('Không thể từ chối đơn ứng tuyển. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Handle schedule interview
    const handleScheduleInterview = () => {
        navigation.navigate('ScheduleInterview', {
            applicationId: refreshedApplication.id,
            jobSeekerId: refreshedApplication.job_seeker.id,
            jobPostingId: refreshedApplication.job_posting_detail.id,
            onGoBack: () => {
                // Refresh data when returning from scheduling screen
                fetchApplicationData();
            }
        });
        setInterviewDialogVisible(false);
    };

    // Handle join interview
    const handleJoinInterview = () => {
        if (!interviewData || !interviewData.location) {
            Alert.alert('Lỗi', 'Không tìm thấy link phòng phỏng vấn hợp lệ');
            return;
        }
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', interviewData.location);
        // Mở phòng họp trong WebView
        navigation.navigate('VideoConference', {
            meetingUrl: interviewData.location,
            meetingTitle: `Phỏng vấn: ${refreshedApplication.job_posting_title}`
        });
    };

    // Handle offer job
    const handleOfferJob = async () => {
        try {
            setLoading(true);
            // Sử dụng hàm API mới
            console.log(refreshedApplication.id);
            await offerApplication(userToken, refreshedApplication.id);
            Alert.alert(
                'Thành công',
                'Đã gửi đề nghị việc làm cho ứng viên',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (err) {
            console.error('Error offering job:', err);
            setError('Không thể gửi đề nghị việc làm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Open resume
    const handleOpenResume = () => {
        if (refreshedApplication.resume_detail && refreshedApplication.resume_detail.file_path) {
            navigation.navigate('PDFViewer', {
                uri: refreshedApplication.resume_detail.file_path,
                title: refreshedApplication.resume_detail.title || 'CV của ứng viên'
            });
        }
    };

    // Render interview info
    const renderInterviewInfo = () => {
        if (refreshedApplication.status !== 'Interview Scheduled') {
            return null;
        }

        if (fetchingInterview) {
            return (
                <Surface style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin phỏng vấn</Text>
                    <Divider style={styles.divider} />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#9C27B0" />
                        <Text style={styles.loadingText}>Đang tải thông tin phỏng vấn...</Text>
                    </View>
                </Surface>
            );
        }

        if (!interviewData) {
            return (
                <Surface style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin phỏng vấn</Text>
                    <Divider style={styles.divider} />
                    <View style={styles.infoSection}>
                        <Text style={styles.errorText}>Không tìm thấy thông tin phỏng vấn</Text>
                        <Button
                            mode="outlined"
                            onPress={fetchInterviewData}
                            style={styles.retryButton}
                        >
                            Thử lại
                        </Button>
                    </View>
                </Surface>
            );
        }

        return (
            <Surface style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin phỏng vấn</Text>
                <Divider style={styles.divider} />

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color="#9C27B0" />
                        <Text style={styles.infoLabel}>Thời gian:</Text>
                        <Text style={styles.infoValue}>{formatDate(interviewData.scheduled_at)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="videocam-outline" size={20} color="#9C27B0" />
                        <Text style={styles.infoLabel}>Phòng họp:</Text>
                        <TouchableOpacity onPress={handleJoinInterview}>
                            <Text style={[styles.infoValue, styles.linkText]}>Nhấn vào đây để tham gia phỏng vấn</Text>
                        </TouchableOpacity>
                    </View>

                    {interviewData.notes && (
                        <View style={styles.infoRow}>
                            <Ionicons name="document-text-outline" size={20} color="#9C27B0" />
                            <Text style={styles.infoLabel}>Ghi chú:</Text>
                            <Text style={styles.infoValue}>{interviewData.notes}</Text>
                        </View>
                    )}

                    <Button
                        mode="contained"
                        icon="video"
                        style={styles.joinInterviewButton}
                        onPress={handleJoinInterview}
                    >
                        Vào phòng phỏng vấn
                    </Button>

                    <Button
                        mode="outlined"
                        icon={({ size, color }) => (
                            <Ionicons name="chatbubble-outline" size={size} color={color} />
                        )}
                        style={styles.actionButton}
                        onPress={async () => {
                            try {
                                const conversationId = await createConversation(
                                    userInfo.id,
                                    application.job_seeker.id,
                                    {
                                        first_name: userInfo.first_name || userInfo.company_name,
                                        last_name: userInfo.last_name || '',
                                        avatar_url: userInfo.avatar_url || userInfo.company_logo
                                    },
                                    {
                                        first_name: application.job_seeker.first_name,
                                        last_name: application.job_seeker.last_name,
                                        avatar_url: application.job_seeker.avatar_url
                                    }
                                );

                                navigation.navigate('Chat', {
                                    conversationId,
                                    otherUser: {
                                        name: `${application.job_seeker.first_name} ${application.job_seeker.last_name}`,
                                        avatar: application.job_seeker.avatar_url
                                    }
                                });
                            } catch (error) {
                                console.error('Error creating conversation:', error);
                                Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.');
                            }
                        }}
                    >
                        Nhắn tin với ứng viên
                    </Button>
                </View>
            </Surface>
        );
    };

    // Render action buttons based on application status
    const renderActionButtons = () => {
        switch (refreshedApplication.status) {
            case 'Applied':
                return (
                    <View style={styles.actionButtonsContainer}>
                        <Button
                            mode="contained"
                            icon="calendar"
                            style={[styles.actionButton, styles.interviewButton]}
                            onPress={() => setInterviewDialogVisible(true)}
                            loading={loading}
                            disabled={loading}
                        >
                            Lên lịch phỏng vấn
                        </Button>

                        <Button
                            mode="contained"
                            icon="close-circle"
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => setRejectDialogVisible(true)}
                            loading={loading}
                            disabled={loading}
                        >
                            Từ chối
                        </Button>
                    </View>
                );

            case 'Interview Scheduled':
                return (
                    <View style={styles.actionButtonsContainer}>
                        <Button
                            mode="contained"
                            icon="check-circle"
                            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                            onPress={() => setOfferDialogVisible(true)}
                            loading={loading}
                            disabled={loading}
                        >
                            Đề nghị
                        </Button>

                        <Button
                            mode="contained"
                            icon="close-circle"
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => setRejectDialogVisible(true)}
                            loading={loading}
                            disabled={loading}
                        >
                            Từ chối
                        </Button>
                    </View>
                );

            case 'Offered':
                return (
                    <View style={styles.actionButtonsContainer}>
                        <Button
                            mode="contained"
                            icon="clock-outline"
                            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                            disabled={true}
                        >
                            Chờ xác nhận
                        </Button>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đơn ứng tuyển</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Applicant Info Card */}
                <Surface style={styles.card}>
                    <View style={styles.applicantHeader}>
                        <Image
                            source={{ uri: refreshedApplication.job_seeker.avatar_url || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                        />
                        <View style={styles.applicantInfo}>
                            <Text style={styles.applicantName}>
                                {refreshedApplication.job_seeker.first_name || ''} {refreshedApplication.job_seeker.last_name || refreshedApplication.job_seeker.username}
                            </Text>
                            <Text style={styles.applicantEmail}>{refreshedApplication.job_seeker.email}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(refreshedApplication.status) }]}>
                            <Text style={styles.statusText}>{refreshedApplication.status_display}</Text>
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                            <Text style={styles.infoLabel}>Ngày ứng tuyển:</Text>
                            <Text style={styles.infoValue}>{formatDate(refreshedApplication.applied_at)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color="#666" />
                            <Text style={styles.infoLabel}>Cập nhật:</Text>
                            <Text style={styles.infoValue}>{formatDate(refreshedApplication.updated_at)}</Text>
                        </View>
                    </View>
                </Surface>

                {/* Interview Info Card - only shown if status is Interview Scheduled */}
                {renderInterviewInfo()}

                {/* Job Info Card */}
                <Surface style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin công việc</Text>
                    <Divider style={styles.divider} />

                    <View style={styles.jobHeader}>
                        <Image
                            source={{ uri: refreshedApplication.job_posting_detail.recruiter_profile.company_logo || 'https://via.placeholder.com/150' }}
                            style={styles.companyLogo}
                        />
                        <View style={styles.jobTitleContainer}>
                            <Text style={styles.jobTitle}>{refreshedApplication.job_posting_title}</Text>
                            <Text style={styles.companyName}>
                                {refreshedApplication.job_posting_detail.recruiter_profile.company_name}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.jobDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <Text style={styles.detailLabel}>Địa điểm:</Text>
                            <Text style={styles.detailValue}>{refreshedApplication.job_posting_detail.location}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="briefcase-outline" size={20} color="#666" />
                            <Text style={styles.detailLabel}>Loại công việc:</Text>
                            <Text style={styles.detailValue}>{refreshedApplication.job_posting_detail.job_type}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="cash-outline" size={20} color="#666" />
                            <Text style={styles.detailLabel}>Mức lương:</Text>
                            <Text style={styles.detailValue}>
                                {refreshedApplication.job_posting_detail.salary_min && refreshedApplication.job_posting_detail.salary_max ?
                                    `${refreshedApplication.job_posting_detail.salary_min.toLocaleString()} - ${refreshedApplication.job_posting_detail.salary_max.toLocaleString()} VNĐ` :
                                    'Thỏa thuận'}
                            </Text>
                        </View>
                    </View>
                </Surface>

                {/* Resume Card */}
                {refreshedApplication.resume_detail && (
                    <Surface style={styles.card}>
                        <Text style={styles.cardTitle}>CV ứng viên</Text>
                        <Divider style={styles.divider} />

                        <View style={styles.resumeInfo}>
                            <View style={styles.resumeHeader}>
                                <Ionicons name="document-text-outline" size={24} color="#2196F3" />
                                <Text style={styles.resumeTitle}>{refreshedApplication.resume_detail.title || 'CV của ứng viên'}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.viewResumeButton}
                                onPress={handleOpenResume}
                            >
                                <Text style={styles.viewResumeText}>Xem CV</Text>
                                <Ionicons name="open-outline" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </Surface>
                )}

                {/* Cover Letter Card */}
                {refreshedApplication.cover_letter && (
                    <Surface style={styles.card}>
                        <Text style={styles.cardTitle}>Thư xin việc</Text>
                        <Divider style={styles.divider} />

                        <Text style={styles.coverLetterText}>{refreshedApplication.cover_letter}</Text>
                    </Surface>
                )}

                {/* Action Buttons */}
                {renderActionButtons()}

                {/* Error message */}
                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}

                {/* Bottom spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

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
                        <Button textColor="#F44336" onPress={handleReject}>Từ chối</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Offer Dialog */}
            <Portal>
                <Dialog
                    visible={offerDialogVisible}
                    onDismiss={() => setOfferDialogVisible(false)}
                >
                    <Dialog.Title>Đề nghị việc làm</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Bạn muốn gửi đề nghị việc làm cho ứng viên này?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setOfferDialogVisible(false)}>Hủy</Button>
                        <Button textColor="#FF9800" onPress={handleOfferJob}>Gửi đề nghị</Button>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        backgroundColor: '#fff',
        margin: 16,
        marginBottom: 8,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    applicantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    applicantInfo: {
        flex: 1,
        marginLeft: 16,
    },
    applicantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    applicantEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
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
    divider: {
        marginVertical: 16,
        backgroundColor: '#eee',
        height: 1,
    },
    infoSection: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        width: 120,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    linkText: {
        color: '#2196F3',
        textDecorationLine: 'underline',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    companyLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    jobTitleContainer: {
        marginLeft: 16,
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    companyName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    jobDetails: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        width: 120,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    resumeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resumeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resumeTitle: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    viewResumeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    viewResumeText: {
        color: '#fff',
        marginRight: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    coverLetterText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    interviewButton: {
        backgroundColor: '#2196F3',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    joinInterviewButton: {
        backgroundColor: '#9C27B0',
        marginTop: 16,
    },
    errorText: {
        color: '#F44336',
        textAlign: 'center',
        marginVertical: 16,
    },
    bottomSpacing: {
        height: 40,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
    },
    retryButton: {
        marginTop: 8,
        alignSelf: 'center',
    },
});

export default ApplicationDetail;