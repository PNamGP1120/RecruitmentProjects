import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FilterModal from './FilterModal';
import { getJobs } from '../../api/job';
import { JobCard } from '../../components/JobCard';

export default function JobSearchScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    job_type: undefined,
    location: '',
    salary_min: 0,
    ordering: '-created_at'
  });

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getJobs(filters);
      setJobs(response.results || []);
    } catch (error) {
      setError('Failed to load jobs. Please try again.');
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchText.trim()
    }));
  };

  const handleFilterApply = (filterData) => {
    setFilters(prev => ({
      ...prev,
      ...filterData
    }));
    setFilterVisible(false);
  };

  const renderSearchBar = () => (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={22} color="#bdbdbd" style={{ marginLeft: 10 }} />
      <TextInput
        style={styles.searchInput}
        placeholder="Job title, company, location"
        placeholderTextColor="#bdbdbd"
        value={searchText}
        onChangeText={setSearchText}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity 
        style={styles.filterBtn} 
        onPress={() => setFilterVisible(true)}
      >
        <Ionicons name="options-outline" size={22} color="#222" />
      </TouchableOpacity>
    </View>
  );

  const renderJobItem = ({ item }) => (
    <JobCard
      job={item}
      onPress={() => navigation.navigate('JobDetail', { slug: item.slug })}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.resultCount}>
        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
      </Text>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadJobs}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={jobs}
        keyExtractor={item => item.id.toString()}
        renderItem={renderJobItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderSearchBar()}
      {renderContent()}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbff',
    paddingTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 18,
    marginVertical: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#222',
  },
  filterBtn: {
    padding: 8,
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
  },
  resultCount: {
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdbdbd',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});