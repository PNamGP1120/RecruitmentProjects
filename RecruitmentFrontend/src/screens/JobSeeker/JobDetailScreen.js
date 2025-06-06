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
import { getJobDetail } from '../../api/job';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';

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
  const { slug } = route.params;
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetail();
  }, [slug]);

  const fetchJobDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getJobDetail(slug);
      setJob(data);
    } catch (error) {
      setError('Failed to load job details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchJobDetail} />;
  }

  const handleApply = () => {
    Alert.alert('Ứng tuyển', 'Bạn đã ứng tuyển thành công!');
    // Thực tế: gọi API ứng tuyển tại đây
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <Image source={{ uri: job.recruiter_profile?.company_logo_url }} style={styles.logo} />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.recruiter_profile?.company_name}</Text>
          <Text style={styles.location}>{job.location}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mô tả công việc</Text>
        <Text style={styles.description}>{job.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yêu cầu</Text>
        <Text style={styles.requirements}>{job.requirements || 'Không có yêu cầu cụ thể'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin khác</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Loại công việc:</Text>
          <Text style={styles.value}>{job.job_type}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mức lương:</Text>
          <Text style={styles.value}>
            {formatSalary(job.salary_min, job.salary_max)}
          </Text>
        </View>
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
  headerInfo: {
    flex: 1,
    marginLeft: 15,
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
  requirements: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
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

// Helper function to format salary
const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';
  if (!min) return `${max.toLocaleString()} VNĐ`;
  if (!max) return `Từ ${min.toLocaleString()} VNĐ`;
  return `${min.toLocaleString()} - ${max.toLocaleString()} VNĐ`;
};
