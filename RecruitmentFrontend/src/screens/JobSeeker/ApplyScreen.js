// src/screens/JobSeeker/ApplyScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getJobDetail } from '../../api/job';
import { createApplication } from '../../api/application';
import { apiRequest } from '../../api/request';
import { ENDPOINTS } from '../../api/config';
import { getApplications } from '../../api/application';

export default function ApplyScreen({ route, navigation }) {
  const { userToken, userInfo } = useAuth();
  const { slug } = route.params;

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy thông tin job
      const jobRes = await getJobDetail(slug, userToken);
      setJob(jobRes);

      // Lấy danh sách resume
      const resumesRes = await apiRequest(ENDPOINTS.RESUMES, 'GET', userToken);
      setResumes(resumesRes.results || resumesRes);
      // Chọn resume mặc định
      const activeResume = (resumesRes.results || resumesRes).find(r => r.is_active);
      setSelectedResume(activeResume ? activeResume.id : (resumesRes.results?.[0]?.id || resumesRes[0]?.id));

      // Kiểm tra đã ứng tuyển chưa
      const apps = await getApplications(userToken, { job_posting: jobRes.id });
      if (apps.results && apps.results.length > 0) {
        setAlreadyApplied(true);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!selectedResume) {
      Alert.alert('Vui lòng chọn resume!');
      return;
    }
    setSubmitting(true);
    try {
      await createApplication(userToken, {
        job_posting: job.id,
        resume: selectedResume,
        cover_letter: coverLetter,
      });
      Alert.alert('Thành công', 'Bạn đã ứng tuyển thành công!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Ứng tuyển thất bại');
    }
    setSubmitting(false);
  };

  if (loading || !job) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  // Lấy thông tin profile
  const fullName = [userInfo?.first_name, userInfo?.last_name].filter(Boolean).join(' ');
  const email = userInfo?.email;

  return (
    <View style={styles.container}>
      {/* Header job info */}
      <View style={styles.headerRow}>
        <Image source={{ uri: job.recruiter_profile?.company_logo }} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.recruiter_profile?.company_name}</Text>
          <View style={styles.row}>
            <Text style={styles.salary}>{job.salary_min && job.salary_max ? `$${parseInt(job.salary_min, 10).toLocaleString()} - $${parseInt(job.salary_max, 10).toLocaleString()}/y` : ''}</Text>
            <Text style={styles.location}>{job.location}</Text>
          </View>
        </View>
      </View>

      {/* Profile */}
      <Text style={styles.sectionTitle}>Your Profile</Text>
      <View style={styles.profileBox}>
        <Image source={{ uri: userInfo?.avatar_url || 'https://ui-avatars.com/api/?name=User' }} style={styles.profileAvatar} />
        <Text style={styles.profileName}>{fullName}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
      </View>

      {/* Resume */}
      <Text style={styles.sectionTitle}>Select a resume</Text>
      <FlatList
        data={resumes}
        horizontal
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.resumeBox,
              selectedResume === item.id && styles.resumeBoxActive,
            ]}
            onPress={() => setSelectedResume(item.id)}
          >
            <View style={styles.resumeCheckCircle}>
              {selectedResume === item.id ? <View style={styles.resumeChecked} /> : null}
            </View>
            <Text style={[
              styles.resumeLabel,
              { backgroundColor: item.is_active ? '#2563EB' : '#EF4444', color: '#fff' }
            ]}>
              {item.title}
            </Text>
            <Text style={styles.resumeDate}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 16 }}
        showsHorizontalScrollIndicator={false}
      />

      {/* Cover letter */}
      <Text style={styles.sectionTitle}>Cover Later</Text>
      <TextInput
        style={styles.coverInput}
        placeholder="Write a cover letter......"
        value={coverLetter}
        onChangeText={setCoverLetter}
        multiline
      />

      {/* Apply button */}
      <TouchableOpacity
        style={[styles.applyButton, alreadyApplied && { backgroundColor: '#ccc' }]}
        onPress={handleApply}
        disabled={submitting || alreadyApplied}
      >
        <Text style={styles.applyButtonText}>
          {alreadyApplied ? 'Đã ứng tuyển' : 'Apply'}
        </Text>
      </TouchableOpacity>
      {alreadyApplied && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>
          Bạn đã ứng tuyển công việc này!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logo: { width: 56, height: 56, borderRadius: 28, marginRight: 16, backgroundColor: '#F3F4F6' },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  company: { color: '#6B7280', marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  salary: { color: '#2563EB', fontWeight: 'bold', marginRight: 12 },
  location: { color: '#6B7280', marginRight: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  profileBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  profileAvatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  profileName: { fontSize: 17, fontWeight: 'bold', color: '#222' },
  profileEmail: { color: '#6B7280' },
  resumeBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginRight: 12, alignItems: 'center', minWidth: 120, borderWidth: 1, borderColor: '#E5E7EB' },
  resumeBoxActive: { borderColor: '#2563EB', shadowColor: '#2563EB', shadowOpacity: 0.1, shadowRadius: 6 },
  resumeCheckCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  resumeChecked: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB' },
  resumeLabel: { fontWeight: 'bold', fontSize: 13, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  resumeDate: { color: '#6B7280', fontSize: 12 },
  coverInput: { backgroundColor: '#fff', borderRadius: 12, padding: 12, minHeight: 60, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  applyButton: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
