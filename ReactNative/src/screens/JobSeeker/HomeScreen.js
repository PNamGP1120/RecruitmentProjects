import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Mẫu dữ liệu Featured Jobs
const featuredJobsSample = [
  {
    id: '1a2b3c4d',
    title: 'Software Engineer',
    description: 'Develop scalable web applications...',
    location: 'California, USA',
    salary_min: 100000,
    salary_max: 150000,
    job_type: 'Full-time',
    recruiter_profile: {
      company_name: 'Facebook',
      company_logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png',
    },
  },
  {
    id: '2b3c4d5e',
    title: 'Product Designer',
    description: 'Design user-centered products...',
    location: 'New York, USA',
    salary_min: 90000,
    salary_max: 120000,
    job_type: 'Full-time',
    recruiter_profile: {
      company_name: 'Google',
      company_logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    },
  },
  // Thêm các công việc khác nếu muốn
];

// Mẫu dữ liệu Popular Jobs (cấu trúc tương tự)
const popularJobsSample = [
  {
    id: '3c4d5e6f',
    title: 'Marketing Manager',
    location: 'Seattle, USA',
    salary_min: 80000,
    salary_max: 110000,
    job_type: 'Full-time',
    recruiter_profile: {
      company_name: 'Amazon',
      company_logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    },
  },
  {
    id: '4d5e6f7g',
    title: 'Data Scientist',
    location: 'Los Gatos, USA',
    salary_min: 95000,
    salary_max: 140000,
    job_type: 'Full-time',
    recruiter_profile: {
      company_name: 'Netflix',
      company_logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    },
  },
];

// Hàm format tiền lương
const formatSalary = (min, max) => {
  if (!min && !max) return 'Thương lượng';
  if (!max) return `$${min.toLocaleString()}`;
  if (!min) return `$${max.toLocaleString()}`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

export default function JobSeekerHome({ navigation }) {
  const { userInfo } = useContext(AuthContext);

  // Render Featured Job
  const renderFeaturedJob = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.featuredJobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <Image
        source={{ uri: item.recruiter_profile?.company_logo_url }}
        style={styles.companyLogo}
      />
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.companyName}>
        {item.recruiter_profile?.company_name || 'Công ty'}
      </Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.salary}>
        {formatSalary(item.salary_min, item.salary_max)}
      </Text>
      <Text style={styles.jobType}>{item.job_type}</Text>
    </TouchableOpacity>
  );

  // Render Popular Job
  const renderPopularJob = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.popularJobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <Image
        source={{ uri: item.recruiter_profile?.company_logo_url }}
        style={styles.popularCompanyLogo}
      />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.popularJobTitle}>{item.title}</Text>
        <Text style={styles.popularCompanyName}>
          {item.recruiter_profile?.company_name || 'Công ty'}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.popularSalary}>
          {formatSalary(item.salary_min, item.salary_max)}
        </Text>
        <Text style={styles.popularLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.usernameText}>
            {userInfo?.first_name || userInfo?.username || 'User'}{' '}
            <Ionicons name="hand-left-outline" size={22} color="#333" />
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={{ uri: userInfo?.avatar_url }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.onlineIndicator} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" />
        <Text style={styles.searchPlaceholder}>Search a job or position</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => alert('Filter clicked')}
        >
          <Ionicons name="options-outline" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Featured Jobs */}
      <View style={styles.jobsSectionHeader}>
        <Text style={styles.sectionTitle}>Featured Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobSearch')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={featuredJobsSample}
        keyExtractor={(item) => item.id}
        renderItem={renderFeaturedJob}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        style={{ marginBottom: 25 }}
      />

      {/* Popular Jobs */}
      <View style={styles.jobsSectionHeader}>
        <Text style={styles.sectionTitle}>Popular Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobSearch')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={popularJobsSample}
        keyExtractor={(item) => item.id}
        renderItem={renderPopularJob}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: '#6c757d',
    fontWeight: '500',
  },
  usernameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 14,
    height: 14,
    backgroundColor: '#28a745',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    marginHorizontal: 20,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    color: '#adb5bd',
    fontSize: 16,
    fontWeight: '400',
  },
  filterButton: {
    paddingHorizontal: 10,
  },
  jobsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 22,
    color: '#212529',
  },
  seeAllText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredJobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    marginRight: 16,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 14,
    marginBottom: 18,
    alignSelf: 'center',
  },
  jobTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 6,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 10,
    textAlign: 'center',
  },
  location: {
    fontSize: 13,
    color: '#868e96',
    marginBottom: 10,
    textAlign: 'center',
  },
  salary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17a2b8',
    marginBottom: 10,
    textAlign: 'center',
  },
  jobType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  popularJobCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  popularCompanyLogo: {
    width: 54,
    height: 54,
    borderRadius: 14,
  },
  popularJobTitle: {
    fontWeight: '700',
    fontSize: 19,
    color: '#212529',
  },
  popularCompanyName: {
    color: '#868e96',
    marginTop: 3,
    fontSize: 14,
  },
  popularSalary: {
    fontWeight: '700',
    fontSize: 15,
    color: '#17a2b8',
  },
  popularLocation: {
    color: '#adb5bd',
    fontSize: 13,
  },
});

