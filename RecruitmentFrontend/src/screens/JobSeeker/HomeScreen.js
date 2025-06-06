import React, { useState, useEffect, useContext } from 'react';
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
import { getFeaturedJobs, getPopularJobs } from '../../api/job';
import { JobCard } from '../../components/JobCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';

const { width } = Dimensions.get('window');

// Hàm format tiền lương
const formatSalary = (min, max) => {
  if (!min && !max) return 'Thương lượng';
  if (!max) return `$${min.toLocaleString()}`;
  if (!min) return `$${max.toLocaleString()}`;
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

export default function JobSeekerHome({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [popularJobs, setPopularJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [featuredResponse, popularResponse] = await Promise.all([
        getFeaturedJobs(),
        getPopularJobs()
      ]);
      setFeaturedJobs(featuredResponse.results);
      setPopularJobs(popularResponse.results);
    } catch (error) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render Featured Job
  const renderFeaturedJob = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => navigation.navigate('JobDetail', { slug: item.slug })}
    />
  );

  // Render Popular Job
  const renderPopularJob = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => navigation.navigate('JobDetail', { slug: item.slug })}
    />
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchJobs} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Nút 3 gạch mở Drawer */}
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginRight: 16 }}>
          <Ionicons name="menu" size={32} color="#222" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
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
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('JobSearch')}
        >
          <Ionicons name="search" size={20} color="gray" />
          <Text style={styles.searchPlaceholder}>Search a job or position</Text>
          {/* <Ionicons name="options-outline" size={24} color="#555" /> */}
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
        data={featuredJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderFeaturedJob}
        contentContainerStyle={{ paddingHorizontal: 10}}
        style={{ marginBottom: 25}}
      />

      {/* Popular Jobs */}
      <View style={styles.jobsSectionHeader}>
        <Text style={styles.sectionTitle}>Popular Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobSearch')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={popularJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderPopularJob}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 50}}
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
    // flex: 1,
    marginLeft: 12,
    color: '#adb5bd',
    fontSize: 16,
    fontWeight: '400',
  },
  filterButton: {
    paddingHorizontal: 10,
    flexDirection: 'row',
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
});