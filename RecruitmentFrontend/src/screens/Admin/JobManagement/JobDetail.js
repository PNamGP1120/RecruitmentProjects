// src/screens/Admin/JobManagement/JobDetail.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Portal,
  Dialog,
  TextInput,
  ActivityIndicator,
  List,
  Divider,
  Avatar,
  IconButton,
  Menu,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';

const JobDetail = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [historyDialogVisible, setHistoryDialogVisible] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await adminAPI.getJobDetails(jobId);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await adminAPI.approveJob(jobId);
      Alert.alert('Thành công', 'Đã phê duyệt tin tuyển dụng');
      fetchJobDetails();
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
      await adminAPI.rejectJob(jobId, rejectReason);
      setRejectDialogVisible(false);
      Alert.alert('Thành công', 'Đã từ chối tin tuyển dụng');
      fetchJobDetails();
    } catch (error) {
      console.error('Error rejecting job:', error);
      Alert.alert('Lỗi', 'Không thể từ chối tin tuyển dụng');
    }
  };

  const renderStatusChip = (status) => {
    const statusConfig = {
      Pending: { color: '#FFA000', icon: 'timer' },
      Approved: { color: '#4CAF50', icon: 'check-circle' },
      Rejected: { color: '#F44336', icon: 'cancel' },
      Expired: { color: '#9E9E9E', icon: 'event-busy' },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <Chip
        icon={config.icon}
        style={[styles.statusChip, { backgroundColor: `${config.color}20` }]}
        textStyle={{ color: config.color }}
      >
        {status}
      </Chip>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Title>Không tìm thấy thông tin công việc</Title>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Quay lại
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Title style={styles.title}>{job.title}</Title>
              {renderStatusChip(job.status)}
            </View>
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={{ x: 0, y: 0 }}
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  setHistoryDialogVisible(true);
                }}
                title="Lịch sử thay đổi"
                icon="history"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('EditJob', { jobId });
                }}
                title="Chỉnh sửa"
                icon="pencil"
              />
            </Menu>
          </View>

          {/* Company Info */}
          <View style={styles.companyInfo}>
            <Avatar.Image
              size={60}
              source={{ uri: job.company_logo || 'https://via.placeholder.com/60' }}
            />
            <View style={styles.companyDetails}>
              <Title style={styles.companyName}>{job.company_name}</Title>
              <Paragraph>{job.company_address}</Paragraph>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Job Details */}
          <List.Section>
            <List.Item
              title="Địa điểm"
              description={job.location}
              left={() => <List.Icon icon="map-marker" />}
            />
            <List.Item
              title="Mức lương"
              description={`${job.salary_min} - ${job.salary_max} ${job.salary_currency}`}
              left={() => <List.Icon icon="currency-usd" />}
            />
            <List.Item
              title="Loại công việc"
              description={job.job_type}
              left={() => <List.Icon icon="briefcase" />}
            />
            <List.Item
              title="Hạn nộp hồ sơ"
              description={new Date(job.expiration_date).toLocaleDateString()}
              left={() => <List.Icon icon="calendar" />}
            />
          </List.Section>

          <Divider style={styles.divider} />

          {/* Description */}
          <Title style={styles.sectionTitle}>Mô tả công việc</Title>
          <Paragraph style={styles.description}>{job.description}</Paragraph>

          {/* Requirements */}
          <Title style={styles.sectionTitle}>Yêu cầu</Title>
          <Paragraph style={styles.description}>{job.requirements}</Paragraph>

          {/* Skills */}
          <Title style={styles.sectionTitle}>Kỹ năng yêu cầu</Title>
          <View style={styles.skillsContainer}>
            {job.skills.map((skill) => (
              <Chip
                key={skill.id}
                style={styles.skillChip}
                mode="outlined"
              >
                {skill.name}
              </Chip>
            ))}
          </View>

          {/* Recruiter Info */}
          <Title style={styles.sectionTitle}>Người đăng tuyển</Title>
          <Card style={styles.recruiterCard}>
            <Card.Content>
              <View style={styles.recruiterInfo}>
                <Avatar.Image
                  size={40}
                  source={{ uri: job.recruiter.avatar || 'https://via.placeholder.com/40' }}
                />
                <View style={styles.recruiterDetails}>
                  <Title style={styles.recruiterName}>{job.recruiter.name}</Title>
                  <Paragraph>{job.recruiter.email}</Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Card.Content>

        {/* Actions */}
        {job.status === 'Pending' && (
          <Card.Actions style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => setRejectDialogVisible(true)}
              style={styles.rejectButton}
            >
              Từ chối
            </Button>
            <Button
              mode="contained"
              onPress={handleApprove}
              style={styles.approveButton}
            >
              Phê duyệt
            </Button>
          </Card.Actions>
        )}
      </Card>

      {/* Reject Dialog */}
      <Portal>
        <Dialog
          visible={rejectDialogVisible}
          onDismiss={() => setRejectDialogVisible(false)}
        >
          <Dialog.Title>Từ chối tin tuyển dụng</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Lý do từ chối"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectDialogVisible(false)}>Hủy</Button>
            <Button onPress={handleReject}>Xác nhận</Button>
          </Dialog.Actions>
        </Dialog>

        {/* History Dialog */}
        <Dialog
          visible={historyDialogVisible}
          onDismiss={() => setHistoryDialogVisible(false)}
        >
          <Dialog.Title>Lịch sử thay đổi</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.historyScroll}>
              {job.history?.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyAction}>{item.action}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                  <Text style={styles.historyUser}>{item.user.username}</Text>
                  {item.notes && (
                    <Text style={styles.historyNotes}>{item.notes}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setHistoryDialogVisible(false)}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  companyDetails: {
    marginLeft: 16,
    flex: 1,
  },
  companyName: {
    fontSize: 18,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillChip: {
    margin: 4,
  },
  recruiterCard: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
  },
  recruiterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recruiterDetails: {
    marginLeft: 16,
    flex: 1,
  },
  recruiterName: {
    fontSize: 16,
  },
  actions: {
    justifyContent: 'flex-end',
    padding: 16,
  },
  approveButton: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    borderColor: '#F44336',
  },
  historyScroll: {
    maxHeight: 300,
  },
  historyItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyAction: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyDate: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  historyUser: {
    color: '#1976D2',
    marginBottom: 4,
  },
  historyNotes: {
    fontStyle: 'italic',
  },
});

export default JobDetail;