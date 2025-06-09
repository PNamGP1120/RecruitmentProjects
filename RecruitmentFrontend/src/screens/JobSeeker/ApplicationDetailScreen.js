import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getApplicationDetail, withdrawApplication, acceptOffer, rejectOffer } from '../../api/application';
import { getJobSeekerInterviews } from '../../api/jobSeeker';
import { Ionicons } from '@expo/vector-icons';

const TRACK_STEPS = [
  { key: 'Hired', label: 'Hired' },
  { key: 'Offered', label: 'Offered' },
  { key: 'Interview Scheduled', label: 'Interview Scheduled' },
  { key: 'Applied', label: 'Application' },
  { key: 'Withdrawn', label: 'Withdrawn' },
];

export default function ApplicationDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { userToken } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [interview, setInterview] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await getApplicationDetail(userToken, id);
      console.log('Application detail:', res);
      setApplication(res);
      
      console.log('Application status:', res.status);
      if (res.status === 'Interview Scheduled') {
        console.log('Fetching interview data...');
        fetchInterview();
      }
    } catch (e) {
      console.error('Error fetching application detail:', e);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn ứng tuyển');
    }
    setLoading(false);
  };

  const fetchInterview = async () => {
    setLoadingInterview(true);
    try {
      console.log('Fetching interview for application:', id);
      const response = await getJobSeekerInterviews(userToken, { application: id });
      console.log('Interview response:', response);
      
      if (response.results && response.results.length > 0) {
        const latestInterview = response.results[0];
        console.log('Latest interview:', latestInterview);
        setInterview(latestInterview);
      } else {
        console.log('No interviews found');
      }
    } catch (e) {
      console.error('Error fetching interview:', e);
    }
    setLoadingInterview(false);
  };

  const handleJoinInterview = () => {
    if (interview && interview.id) {
      navigation.navigate('Interview', { interviewId: interview.id });
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin phỏng vấn');
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await withdrawApplication(userToken, id);
      Alert.alert('Thành công', 'Bạn đã rút đơn ứng tuyển');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Không thể rút đơn');
    }
    setWithdrawing(false);
  };

  const handleAcceptOffer = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn chấp nhận offer này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Chấp nhận',
          style: 'default',
          onPress: async () => {
            try {
              await acceptOffer(userToken, id);
              Alert.alert('Thành công', 'Bạn đã chấp nhận offer');
              fetchDetail(); // Refresh data
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể chấp nhận offer');
            }
          },
        },
      ]
    );
  };

  const handleRejectOffer = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn từ chối offer này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectOffer(userToken, id);
              Alert.alert('Thành công', 'Bạn đã từ chối offer');
              fetchDetail(); // Refresh data
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể từ chối offer');
            }
          },
        },
      ]
    );
  };

  if (loading || !application) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  const job = application.job_posting_detail || application.job_posting || {};
  const recruiter = job.recruiter_profile || {};

  // Xác định trạng thái hiện tại
  const status = application.status;
  const statusOrder = [
    'Hired',
    'Offered',
    'Interview Scheduled',
    'Applied',
    'Withdrawn',
  ];
  const currentStep = statusOrder.indexOf(status) !== -1 ? statusOrder.indexOf(status) : 3;

  // Thêm hàm render thông tin phỏng vấn
  const renderInterviewInfo = () => {
    console.log('Current application status:', application.status);
    
    if (application.status !== 'Interview Scheduled') {
      console.log('Not showing interview info because status is not Interview Scheduled');
      return null;
    }

    if (loadingInterview) {
      return (
        <View style={styles.interviewCard}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải thông tin phỏng vấn...</Text>
        </View>
      );
    }

    if (!interview) {
      return (
        <View style={styles.interviewCard}>
          <Text style={styles.errorText}>Không tìm thấy thông tin phỏng vấn</Text>
        </View>
      );
    }

    return (
      <View style={styles.interviewCard}>
        <Text style={styles.interviewTitle}>Thông tin phỏng vấn</Text>
        <View style={styles.interviewInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#2563EB" />
            <Text style={styles.infoLabel}>Thời gian:</Text>
            <Text style={styles.infoValue}>
              {new Date(interview.scheduled_at).toLocaleString('vi-VN')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="videocam-outline" size={20} color="#2563EB" />
            <Text style={styles.infoLabel}>Phòng họp:</Text>
            <TouchableOpacity onPress={handleJoinInterview}>
              <Text style={[styles.infoValue, styles.linkText]}>
                Nhấn vào đây để tham gia phỏng vấn
              </Text>
            </TouchableOpacity>
          </View>

          {interview.notes && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#2563EB" />
              <Text style={styles.infoLabel}>Ghi chú:</Text>
              <Text style={styles.infoValue}>{interview.notes}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinInterview}
          >
            <Ionicons name="videocam" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Vào phòng phỏng vấn</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Cập nhật hàm render nút withdraw
  const renderWithdrawButton = () => {
    // Hiển thị nút withdraw khi status là Applied, Interview Scheduled hoặc Offered
    if (['Applied', 'Interview Scheduled', 'Offered'].includes(application.status)) {
      return (
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={handleWithdraw}
          disabled={withdrawing}
        >
          {withdrawing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.withdrawButtonText}>Rút đơn ứng tuyển</Text>
          )}
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Cập nhật hàm render action buttons
  const renderActionButtons = () => {
    switch (application.status) {
      case 'Offered':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptOffer}
            >
              <Text style={styles.actionButtonText}>Chấp nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.withdrawButton]}
              onPress={handleWithdraw}
            >
              <Text style={styles.actionButtonText}>Rút đơn</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Applied':
      case 'Interview Scheduled':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.withdrawButton]}
              onPress={handleWithdraw}
            >
              <Text style={styles.actionButtonText}>Rút đơn</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Job Info */}
      <View style={styles.jobInfoRow}>
        <Image source={{ uri: recruiter.company_logo }} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{recruiter.company_name}</Text>
          <View style={styles.row}>
            <Text style={styles.salary}>
              {job.salary_min && job.salary_max
                ? `$${parseInt(job.salary_min, 10).toLocaleString()} - $${parseInt(job.salary_max, 10).toLocaleString()}/y`
                : ''}
            </Text>
            <Text style={styles.location}>{job.location}</Text>
          </View>
        </View>
      </View>
      {/* Track Application */}
      <Text style={styles.sectionTitle}>Track Application</Text>
      <View style={styles.trackContainer}>
        {TRACK_STEPS.map((step, idx) => (
          <View key={step.key} style={styles.trackStep}>
            <View style={[
              styles.circle,
              idx === currentStep ? styles.circleActive : styles.circleInactive,
              step.key === 'Withdrawn' && idx === currentStep ? styles.circleWithdrawn : null
            ]}>
              {idx === currentStep ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={[
              styles.trackLabel,
              idx === currentStep ? styles.trackLabelActive : styles.trackLabelInactive,
              step.key === 'Withdrawn' && idx === currentStep ? styles.trackLabelWithdrawn : null
            ]}>
              {step.label}
            </Text>
            {idx === 0 && status !== 'Hired' && (
              <Text style={styles.notYet}>Not yet</Text>
            )}
            {idx < TRACK_STEPS.length - 1 && (
              <View style={[
                styles.trackLine,
                step.key === 'Withdrawn' && idx === currentStep ? styles.trackLineWithdrawn : null
              ]} />
            )}
          </View>
        ))}
      </View>
      
      {/* Thêm phần hiển thị thông tin phỏng vấn */}
      {renderInterviewInfo()}
      
      {/* Action Buttons */}
      {renderActionButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 40},
  jobInfoRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20 },
  logo: { width: 56, height: 56, borderRadius: 28, marginRight: 16, backgroundColor: '#F3F4F6' },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  company: { color: '#6B7280', marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  salary: { color: '#2563EB', fontWeight: 'bold', marginRight: 12 },
  location: { color: '#6B7280', marginRight: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8, marginLeft: 20 },
  trackContainer: { marginLeft: 40, marginTop: 10 },
  trackStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  circle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  circleActive: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
  circleInactive: { borderColor: '#D1D5DB', backgroundColor: '#fff' },
  checkMark: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  trackLabel: { fontSize: 16, fontWeight: 'bold' },
  trackLabelActive: { color: '#111' },
  trackLabelInactive: { color: '#9CA3AF' },
  notYet: { color: '#9CA3AF', fontSize: 13, marginLeft: 8 },
  trackLine: { width: 2, height: 32, backgroundColor: '#D1D5DB', position: 'absolute', left: 13, top: 28 },
  withdrawButton: { backgroundColor: '#EF4444', borderRadius: 10, paddingVertical: 16, alignItems: 'center', margin: 20 },
  withdrawButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  interviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  interviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
  },
  interviewInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  linkText: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  joinButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  withdrawButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  circleWithdrawn: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  trackLabelWithdrawn: {
    color: '#EF4444',
  },
  trackLineWithdrawn: {
    backgroundColor: '#EF4444',
  },
});
