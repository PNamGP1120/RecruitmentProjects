import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getApplicationDetail, withdrawApplication } from '../../api/application';

const TRACK_STEPS = [
  { key: 'Offered', label: 'Offered' },
  { key: 'Interview Scheduled', label: 'Interview Scheduled' },
  { key: 'Applied', label: 'Application' },
];

export default function ApplicationDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { userToken } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await getApplicationDetail(userToken, id);
      setApplication(res);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn ứng tuyển');
    }
    setLoading(false);
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

  if (loading || !application) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  const job = application.job_posting_detail || application.job_posting || {};
  const recruiter = job.recruiter_profile || {};

  // Xác định trạng thái hiện tại
  const status = application.status;
  const statusOrder = [
    'Offered',
    'Interview Scheduled',
    'Applied',
  ];
  const currentStep = statusOrder.indexOf(status) !== -1 ? statusOrder.indexOf(status) : 2;

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
              idx === currentStep ? styles.circleActive : styles.circleInactive
            ]}>
              {idx === currentStep ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={[
              styles.trackLabel,
              idx === currentStep ? styles.trackLabelActive : styles.trackLabelInactive
            ]}>
              {step.label}
            </Text>
            {idx === 0 && status !== 'Offered' && (
              <Text style={styles.notYet}>Not yet</Text>
            )}
            {idx < TRACK_STEPS.length - 1 && (
              <View style={styles.trackLine} />
            )}
          </View>
        ))}
      </View>
      {/* Withdraw Button */}
      <TouchableOpacity
        style={styles.withdrawButton}
        onPress={handleWithdraw}
        disabled={withdrawing}
      >
        <Text style={styles.withdrawButtonText}>Withdraw</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 40 },
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
});
