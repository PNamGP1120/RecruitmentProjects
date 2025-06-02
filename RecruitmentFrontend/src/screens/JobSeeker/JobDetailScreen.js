import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';

const sampleJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Facebook',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png',
    location: 'California, USA',
    salary: '$180,000/year',
    jobType: 'Full-time',
    description:
      'We are looking for a talented Software Engineer to join our team. You will be responsible for building scalable web applications.',
    requirements: [
      '3+ years experience in software development',
      'Proficient in JavaScript and React',
      'Experience with REST APIs',
      'Strong problem solving skills',
    ],
  },
  // ...thêm các công việc khác nếu cần
];

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);

  useEffect(() => {
    // Ở đây bạn có thể fetch data chi tiết từ backend qua jobId
    // Hiện tại lấy từ sampleJobs
    const foundJob = sampleJobs.find((j) => j.id === jobId);
    if (!foundJob) {
      Alert.alert('Thông báo', 'Không tìm thấy công việc');
      navigation.goBack();
    } else {
      setJob(foundJob);
    }
  }, [jobId]);

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải chi tiết công việc...</Text>
      </View>
    );
  }

  const handleApply = () => {
    Alert.alert('Ứng tuyển', 'Bạn đã ứng tuyển thành công!');
    // Thực tế: gọi API ứng tuyển tại đây
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <Image source={{ uri: job.logo }} style={styles.logo} />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
          <Text style={styles.location}>{job.location}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Loại công việc:</Text>
        <Text style={styles.value}>{job.jobType}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Mức lương:</Text>
        <Text style={styles.value}>{job.salary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mô tả công việc</Text>
        <Text style={styles.description}>{job.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yêu cầu</Text>
        {job.requirements.map((req, index) => (
          <Text key={index} style={styles.requirement}>• {req}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <Text style={styles.applyButtonText}>Ứng tuyển ngay</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9ff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  company: {
    fontSize: 16,
    color: '#555',
    marginTop: 3,
  },
  location: {
    fontSize: 14,
    color: '#888',
    marginTop: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    width: 110,
    color: '#555',
  },
  value: {
    color: '#333',
    flexShrink: 1,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  requirement: {
    fontSize: 15,
    color: '#444',
    marginVertical: 2,
  },
  applyButton: {
    marginTop: 25,
    backgroundColor: '#004aad',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
