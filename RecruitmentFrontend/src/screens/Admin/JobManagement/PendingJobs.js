// src/screens/Admin/JobManagement/PendingJobs.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Searchbar,
  ActivityIndicator,
  Portal,
  Dialog,
  TextInput,
  IconButton,
  Menu,
  Divider,
  List,
  Avatar,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useFocusEffect } from '@react-navigation/native';

const PendingJobs = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingJobs({
        search: searchQuery,
        sort_by: sortBy,
        order: sortOrder,
        status: 'Pending',
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách việc làm chờ duyệt');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch jobs on initial load and when returning to screen
  useFocusEffect(
    useCallback(() => {
      fetchPendingJobs();
    }, [searchQuery, sortBy, sortOrder])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingJobs();
  };

  const handleApprove = async (jobId) => {
    try {
      await adminAPI.approveJob(jobId);
      Alert.alert('Thành công', 'Đã phê duyệt tin tuyển dụng');
      fetchPendingJobs();
    } catch (error) {
      console.error('Error approving job:', error);
      Alert.alert('Lỗi', 'Không thể phê duyệt tin tuyển dụng');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await adminAPI.rejectJob(selectedJob.id, rejectReason);
      setRejectDialogVisible(false);
      setRejectReason('');
      setSelectedJob(null);
      Alert.alert('Thành công', 'Đã từ chối tin tuyển dụng');
      fetchPendingJobs();
    } catch (error) {
      console.error('Error rejecting job:', error);
      Alert.alert('Lỗi', 'Không thể từ chối tin tuyển dụng');
    }
  };

  const showRejectDialog = (job) => {
    setSelectedJob(job);
    setRejectDialogVisible(true);
  };

  const renderJobCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.companyInfo}>
            <Avatar.Image
              size={40}
              source={{ uri: item.company_logo || 'https://via.placeholder.com/40' }}
            />
            <View style={styles.companyDetails}>
              <Title style={styles.jobTitle}>{item.title}</Title>
              <Paragraph style={styles.companyName}>{item.company_name}</Paragraph>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.jobDetails}>
          <List.Item
            title="Địa điểm"
            description={item.location}
            left={() => <List.Icon icon="map-marker" />}
            titleStyle={styles.detailTitle}
            descriptionStyle={styles.detailDescription}
          />
          <List.Item
            title="Mức lương"
            description={`${item.salary_min} - ${item.salary_max} ${item.salary_currency}`}
            left={() => <List.Icon icon="currency-usd" />}
            titleStyle={styles.detailTitle}
            descriptionStyle={styles.detailDescription}
          />
        </View>

        <View style={styles.skillsContainer}>
          {item.skills && item.skills.map((skill) => (
            <Chip
              key={skill.id}
              style={styles.skillChip}
              textStyle={styles.skillText}
            >
              {skill.name}
            </Chip>
          ))}
        </View>

        <View style={styles.timeInfo}>
          <Chip icon="clock-outline" style={styles.timeChip}>
            {new Date(item.created_at).toLocaleDateString()}
          </Chip>
          <Chip icon="calendar" style={styles.timeChip}>
            Hết hạn: {new Date(item.expiration_date).toLocaleDateString()}
          </Chip>
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button
          mode="text"
          onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
        >
          Chi tiết
        </Button>
        <Button
          mode="outlined"
          onPress={() => showRejectDialog(item)}
          style={styles.rejectButton}
        >
          Từ chối
        </Button>
        <Button
          mode="contained"
          onPress={() => handleApprove(item.id)}
          style={styles.approveButton}
        >
          Phê duyệt
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Tìm kiếm việc làm..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          onSubmitEditing={fetchPendingJobs}
        />
        <View style={styles.filterContainer}>
          <Button
            mode="outlined"
            onPress={() => setFilterMenuVisible(true)}
            icon="filter-variant"
            style={styles.filterButton}
          >
            Sắp xếp
          </Button>
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={{}}
          >
            <Menu.Item
              onPress={() => {
                setSortBy('created_at');
                setSortOrder('desc');
                setFilterMenuVisible(false);
              }}
              title="Mới nhất"
              icon={sortBy === 'created_at' && sortOrder === 'desc' ? 'check' : ''}
            />
            <Menu.Item
              onPress={() => {
                setSortBy('created_at');
                setSortOrder('asc');
                setFilterMenuVisible(false);
              }}
              title="Cũ nhất"
              icon={sortBy === 'created_at' && sortOrder === 'asc' ? 'check' : ''}
            />
            <Menu.Item
              onPress={() => {
                setSortBy('salary_min');
                setSortOrder('desc');
                setFilterMenuVisible(false);
              }}
              title="Lương cao nhất"
              icon={sortBy === 'salary_min' && sortOrder === 'desc' ? 'check' : ''}
            />
            <Menu.Item
              onPress={() => {
                setSortBy('salary_min');
                setSortOrder('asc');
                setFilterMenuVisible(false);
              }}
              title="Lương thấp nhất"
              icon={sortBy === 'salary_min' && sortOrder === 'asc' ? 'check' : ''}
            />
          </Menu>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="work-off" size={64} color="#9E9E9E" />
              <Title style={styles.emptyText}>
                Không có tin tuyển dụng nào đang chờ duyệt
              </Title>
            </View>
          )}
        />
      )}

      <Portal>
        <Dialog
          visible={rejectDialogVisible}
          onDismiss={() => {
            setRejectDialogVisible(false);
            setRejectReason('');
            setSelectedJob(null);
          }}
        >
          <Dialog.Title>Từ chối tin tuyển dụng</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Lý do từ chối"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              style={styles.rejectInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setRejectDialogVisible(false);
                setRejectReason('');
                setSelectedJob(null);
              }}
            >
              Hủy
            </Button>
            <Button onPress={handleReject}>Xác nhận</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    elevation: 4,
  },
  searchbar: {
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyDetails: {
    marginLeft: 12,
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  companyName: {
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  jobDetails: {
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 14,
    color: '#666',
  },
  detailDescription: {
    fontSize: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillChip: {
    margin: 4,
    backgroundColor: '#E3F2FD',
  },
  skillText: {
    color: '#1976D2',
  },
  timeInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timeChip: {
    marginRight: 8,
    backgroundColor: '#EEEEEE',
  },
  actions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  approveButton: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    marginLeft: 8,
    borderColor: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 16,
  },
  rejectInput: {
    marginTop: 8,
  },
});

export default PendingJobs;