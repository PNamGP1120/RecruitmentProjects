// src/screens/Admin/JobManagement/JobList.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import * as adminAPI from '../../../api/admin';

const JobList = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchJobs = async (pageNum = 1, search = '') => {
    try {
      const response = await adminAPI.getPendingJobs({
        page: pageNum,
        limit: 10,
        search: search,
      });
      
      if (pageNum === 1) {
        setJobs(response.data);
      } else {
        setJobs([...jobs, ...response.data]);
      }
      
      setHasMore(response.data.length === 10);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchJobs(1, searchQuery);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage, searchQuery);
    }
  };

  const onSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    fetchJobs(1, query);
  };

  const handleApprove = async (jobId) => {
    try {
      await adminAPI.approveJob(jobId);
      onRefresh();
    } catch (error) {
      console.error('Error approving job:', error);
    }
  };

  const handleReject = async (jobId) => {
    try {
      await adminAPI.rejectJob(jobId);
      onRefresh();
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  const renderJobCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
        
        <View style={styles.detailsContainer}>
          <Chip icon="business" style={styles.chip}>
            {item.company_name}
          </Chip>
          <Chip icon="location-on" style={styles.chip}>
            {item.location}
          </Chip>
          <Chip icon="attach-money" style={styles.chip}>
            {item.salary_range}
          </Chip>
        </View>
        
        <View style={styles.statusContainer}>
          <Chip 
            mode="outlined"
            style={[
              styles.statusChip,
              { backgroundColor: item.status === 'Pending' ? '#FFF3E0' : '#E8F5E9' }
            ]}
          >
            {item.status}
          </Chip>
        </View>
      </Card.Content>
      
      <Card.Actions style={styles.actions}>
        <Button onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}>
          Chi tiết
        </Button>
        <Button 
          mode="contained"
          onPress={() => handleApprove(item.id)}
          style={styles.approveButton}
        >
          Duyệt
        </Button>
        <Button 
          mode="outlined"
          onPress={() => handleReject(item.id)}
          style={styles.rejectButton}
        >
          Từ chối
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm việc làm..."
        onChangeText={onSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loading && <ActivityIndicator style={styles.loader} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
    elevation: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginTop: 4,
  },
  statusContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  statusChip: {
    borderRadius: 4,
  },
  actions: {
    justifyContent: 'flex-end',
    padding: 8,
  },
  approveButton: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    marginLeft: 8,
    borderColor: '#F44336',
  },
  loader: {
    padding: 16,
  },
});

export default JobList;