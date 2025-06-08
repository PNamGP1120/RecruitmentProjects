// src/screens/Recruiter/ApplicationDetail.js
import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Surface, Divider, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { rejectApplication, createInterview } from '../../api/recruiter';

const ApplicationDetail = ({ route, navigation }) => {
  const { application } = route.params;
  const { userToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviewDialogVisible, setInterviewDialogVisible] = useState(false);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);

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
      default: return '#9E9E9E';
    }
  };

  // Handle reject application
  const handleReject = async () => {
    try {
      setLoading(true);
      await rejectApplication(userToken, application.id);
      setRejectDialogVisible(false);
      navigation.goBack();
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
      applicationId: application.id,
      jobSeekerId: application.job_seeker.id,
      jobPostingId: application.job_posting_detail.id
    });
    setInterviewDialogVisible(false);
  };

  // Open resume
  const handleOpenResume = () => {
    if (application.resume_detail && application.resume_detail.file_path) {
      navigation.navigate('PDFViewer', {
        uri: application.resume_detail.file_path,
        title: application.resume_detail.title || 'CV của ứng viên'
      });
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
              source={{ uri: application.job_seeker.avatar_url || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <View style={styles.applicantInfo}>
              <Text style={styles.applicantName}>
                {application.job_seeker.first_name || ''} {application.job_seeker.last_name || application.job_seeker.username}
              </Text>
              <Text style={styles.applicantEmail}>{application.job_seeker.email}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
              <Text style={styles.statusText}>{application.status_display}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Ngày ứng tuyển:</Text>
              <Text style={styles.infoValue}>{formatDate(application.applied_at)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Cập nhật:</Text>
              <Text style={styles.infoValue}>{formatDate(application.updated_at)}</Text>
            </View>
          </View>
        </Surface>
        
        {/* Job Info Card */}
        <Surface style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin công việc</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.jobHeader}>
            <Image 
              source={{ uri: application.job_posting_detail.recruiter_profile.company_logo || 'https://via.placeholder.com/150' }}
              style={styles.companyLogo}
            />
            <View style={styles.jobTitleContainer}>
              <Text style={styles.jobTitle}>{application.job_posting_title}</Text>
              <Text style={styles.companyName}>
                {application.job_posting_detail.recruiter_profile.company_name}
              </Text>
            </View>
          </View>
          
          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Địa điểm:</Text>
              <Text style={styles.detailValue}>{application.job_posting_detail.location}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Loại công việc:</Text>
              <Text style={styles.detailValue}>{application.job_posting_detail.job_type}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Mức lương:</Text>
              <Text style={styles.detailValue}>
                {application.job_posting_detail.salary_min && application.job_posting_detail.salary_max ? 
                  `${application.job_posting_detail.salary_min.toLocaleString()} - ${application.job_posting_detail.salary_max.toLocaleString()} VNĐ` : 
                  'Thỏa thuận'}
              </Text>
            </View>
          </View>
        </Surface>
        
        {/* Resume Card */}
        {application.resume_detail && (
          <Surface style={styles.card}>
            <Text style={styles.cardTitle}>CV ứng viên</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.resumeInfo}>
              <View style={styles.resumeHeader}>
                <Ionicons name="document-text-outline" size={24} color="#2196F3" />
                <Text style={styles.resumeTitle}>{application.resume_detail.title || 'CV của ứng viên'}</Text>
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
        {application.cover_letter && (
          <Surface style={styles.card}>
            <Text style={styles.cardTitle}>Thư xin việc</Text>
            <Divider style={styles.divider} />
            
            <Text style={styles.coverLetterText}>{application.cover_letter}</Text>
          </Surface>
        )}
        
        {/* Action Buttons */}
        {application.status === 'Applied' && (
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
        )}
        
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
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginVertical: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ApplicationDetail;