// src/screens/Admin/JobManagement/JobDetail.js
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Portal,
  Dialog,
  ActivityIndicator,
  Divider,
  Avatar,
  Text,
  Surface,
  TextInput,
  Badge,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';

// Lấy kích thước màn hình
const windowDimensions = Dimensions.get('window');
const width = windowDimensions.width;
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

// Thẻ trạng thái
const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return ['#4CAF50', '#388E3C'];
      case 'Pending':
        return ['#FFC107', '#FFA000'];
      case 'Rejected':
        return ['#F44336', '#D32F2F'];
      case 'Draft':
        return ['#9E9E9E', '#757575'];
      case 'Expired':
        return ['#795548', '#5D4037'];
      default:
        return ['#9E9E9E', '#757575'];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return 'check-circle';
      case 'Pending':
        return 'clock-outline';
      case 'Rejected':
        return 'close-circle';
      case 'Draft':
        return 'file-outline';
      case 'Expired':
        return 'calendar-remove';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Approved':
        return 'Đã duyệt';
      case 'Pending':
        return 'Chờ duyệt';
      case 'Rejected':
        return 'Từ chối';
      case 'Draft':
        return 'Bản nháp';
      case 'Expired':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  return (
    <LinearGradient
      colors={getStatusColor(status)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.statusChip}
    >
      <MaterialCommunityIcons
        name={getStatusIcon(status)}
        size={14}
        color="#fff"
      />
      <Text style={styles.statusText}>
        {getStatusText(status)}
      </Text>
    </LinearGradient>
  );
};

const JobDetail = ({ route, navigation }) => {
  const { slug } = route.params;
  // Sử dụng userToken từ AuthContext
  const { userToken } = useAuth();

  // State variables
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch job details when the component mounts or when slug changes
  useFocusEffect(
    useCallback(() => {
      fetchJobDetails();
    }, [slug, userToken])
  );
  
  // Fetch job details from API
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      console.log('Đang tải thông tin công việc với slug:', slug);
      
      // Kiểm tra token xác thực
      if (!userToken) {
        console.error('Không có token xác thực');
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }
      
      // Gọi API với xử lý lỗi cải tiến
      const response = await adminAPI.getJobDetail(slug, userToken);
      console.log('Phản hồi API thành công');
      setJob(response);
      setError(null);
    } catch (error) {
      console.error('Lỗi tải thông tin công việc:', error);
      
      // Xử lý lỗi cụ thể
      if (error.message && error.message.includes('401')) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message && error.message.includes('404')) {
        setError('Không tìm thấy thông tin công việc.');
      } else {
        setError('Không thể tải thông tin công việc. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle job approval
  const handleApprove = () => {
    setConfirmDialogVisible(true);
  };

  // Handle job rejection
  const handleReject = () => {
    setRejectDialogVisible(true);
  };

  // Execute approve action
  const executeApprove = async () => {
    try {
      setLoading(true);
      await adminAPI.approveJob(userToken, slug);
      setConfirmDialogVisible(false);
      
      // Hiển thị thông báo thành công
      Alert.alert('Thành công', 'Đã duyệt công việc thành công.');
      
      // Tải lại thông tin công việc
      fetchJobDetails();
    } catch (error) {
      console.error('Lỗi duyệt công việc:', error);
      setError('Không thể duyệt việc làm. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Execute reject action
  const executeReject = async () => {
    try {
      if (!rejectReason.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối.');
        return;
      }
      
      setLoading(true);
      await adminAPI.rejectJob(userToken, slug, { reason: rejectReason });
      setRejectDialogVisible(false);
      
      // Hiển thị thông báo thành công
      Alert.alert('Thành công', 'Đã từ chối công việc thành công.');
      
      // Tải lại thông tin công việc
      fetchJobDetails();
    } catch (error) {
      console.error('Lỗi từ chối công việc:', error);
      setError('Không thể từ chối việc làm. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Format salary for display
  const formatSalary = (min, max, currency = 'VND') => {
    if (!min && !max) return 'Thỏa thuận';
    if (!min) return `Tối đa ${max.toLocaleString()} ${currency}`;
    if (!max) return `Tối thiểu ${min.toLocaleString()} ${currency}`;
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  };

  // Render job details
  const renderJobDetails = () => {
    if (!job) return null;

    return (
      <View style={styles.detailsContainer}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerCardContent}>
              {/* Company Logo */}
              <View style={styles.companyLogoContainer}>
                {job.company_logo ? (
                  <Avatar.Image
                    size={64}
                    source={{ uri: job.company_logo }}
                    style={styles.companyLogo}
                  />
                ) : (
                  <Avatar.Text
                    size={64}
                    label={job.company_name ? job.company_name.substring(0, 2).toUpperCase() : 'JD'}
                    style={[styles.companyLogo, { backgroundColor: '#E3F2FD' }]}
                    labelStyle={{ color: '#1976D2' }}
                  />
                )}
              </View>
              
              {/* Job Info */}
              <View style={styles.jobTitleContainer}>
                <Title style={styles.jobTitle}>{job.title}</Title>
                <Text style={styles.companyName}>{job.company_name}</Text>
                <View style={styles.jobMetaContainer}>
                  <StatusChip status={job.status} />
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="eye-outline" size={14} color="#64748B" />
                      <Text style={styles.statText}>{job.views_count || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons name="account-outline" size={14} color="#64748B" />
                      <Text style={styles.statText}>{job.applications_count || 0}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Main Content Card */}
        <Card style={styles.contentCard}>
          <Card.Content>
            {/* Job Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Thông tin chung</Text>
              <Divider style={styles.sectionDivider} />
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Địa điểm</Text>
                    <Text style={styles.infoValue}>{job.location || 'Không xác định'}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="briefcase-outline" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Loại công việc</Text>
                    <Text style={styles.infoValue}>{job.job_type || "Toàn thời gian"}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="cash" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Mức lương</Text>
                    <Text style={styles.infoValue}>
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency || 'VND')}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Hạn nộp hồ sơ</Text>
                    <Text style={styles.infoValue}>
                      {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không có hạn'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Mô tả công việc</Text>
              <Divider style={styles.sectionDivider} />
              <Surface style={styles.contentSurface}>
                <Paragraph style={styles.descriptionText}>
                  {job.description || 'Không có mô tả'}
                </Paragraph>
              </Surface>
            </View>
            
            {/* Requirements */}
            <View style={styles.requirementsSection}>
              <Text style={styles.sectionTitle}>Yêu cầu ứng viên</Text>
              <Divider style={styles.sectionDivider} />
              <Surface style={styles.contentSurface}>
                <Paragraph style={styles.requirementsText}>
                  {job.requirements || 'Không có yêu cầu cụ thể'}
                </Paragraph>
              </Surface>
            </View>
            
            {/* Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Quyền lợi</Text>
              <Divider style={styles.sectionDivider} />
              <Surface style={styles.contentSurface}>
                <Paragraph style={styles.benefitsText}>
                  {job.benefits || 'Không có thông tin quyền lợi'}
                </Paragraph>
              </Surface>
            </View>
            
            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <View style={styles.skillsSection}>
                <Text style={styles.sectionTitle}>Kỹ năng yêu cầu</Text>
                <Divider style={styles.sectionDivider} />
                <View style={styles.skillsContainer}>
                  {job.skills.map((skill, index) => (
                    <Chip 
                      key={index} 
                      style={styles.skillChip}
                      textStyle={styles.skillChipText}
                    >
                      {skill.name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
            
            {/* Rejection reason if the job was rejected */}
            {job.status === 'Rejected' && job.reject_reason && (
              <View style={styles.rejectReasonSection}>
                <Text style={styles.rejectReasonTitle}>Lý do từ chối</Text>
                <Surface style={styles.rejectReasonCard}>
                  <Text style={styles.rejectReasonText}>{job.reject_reason}</Text>
                </Surface>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Action Buttons for Pending Jobs */}
        {job.status === 'Pending' && (
          <View style={styles.actionButtonsContainer}>
            <Button
              mode="outlined"
              icon="close-circle"
              onPress={handleReject}
              style={styles.rejectButton}
              contentStyle={styles.actionButtonContent}
              labelStyle={styles.actionButtonLabel}
              color="#F44336"
            >
              Từ chối
            </Button>
            <Button
              mode="contained"
              icon="check-circle"
              onPress={handleApprove}
              style={styles.approveButton}
              contentStyle={styles.actionButtonContent}
              labelStyle={styles.actionButtonLabel}
              color="#4CAF50"
            >
              Duyệt
            </Button>
          </View>
        )}
        
        {/* Action Buttons for Approved/Rejected Jobs */}
        {job.status !== 'Pending' && (
          <View style={styles.actionButtonsContainer}>
            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => navigation.navigate('JobEdit', { slug: job?.slug })}
              style={styles.editButton}
              contentStyle={styles.actionButtonContent}
              labelStyle={styles.editButtonLabel}
            >
              Chỉnh sửa
            </Button>
            <Button
              mode="contained"
              icon="arrow-left"
              onPress={() => navigation.goBack()}
              style={styles.backToListButton}
              contentStyle={styles.actionButtonContent}
              labelStyle={styles.actionButtonLabel}
            >
              Quay lại danh sách
            </Button>
          </View>
        )}
        
        {/* Thông tin thêm */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoCardTitle}>Thông tin đăng tuyển</Text>
            <Divider style={styles.infoCardDivider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Ngày đăng:</Text>
              <Text style={styles.infoRowValue}>
                {new Date(job.created_at).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Cập nhật:</Text>
              <Text style={styles.infoRowValue}>
                {new Date(job.updated_at).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>ID:</Text>
              <Text style={styles.infoRowValue}>{job.id || job.slug}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  // Render header component
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Chi tiết công việc</Text>
        
        {/* Nút chỉnh sửa thay thế menu */}
        {job && (
          <TouchableOpacity 
            style={styles.editHeaderButton}
            onPress={() => navigation.navigate('JobEdit', { slug: job?.slug })}
          >
            <MaterialCommunityIcons name="pencil" size={22} color="#1976D2" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render main content
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải thông tin công việc...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={60} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchJobDetails}
            style={styles.retryButton}
          >
            Thử lại
          </Button>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {renderJobDetails()}
        </ScrollView>
      )}
      
      {/* Confirm Approval Dialog */}
      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>Xác nhận duyệt</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Bạn có chắc chắn muốn duyệt công việc này?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Hủy</Button>
            <Button onPress={executeApprove} color="#4CAF50">Duyệt</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Reject Dialog */}
      <Portal>
        <Dialog visible={rejectDialogVisible} onDismiss={() => setRejectDialogVisible(false)}>
          <Dialog.Title>Từ chối công việc</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Vui lòng nhập lý do từ chối:</Paragraph>
            <TextInput
              mode="outlined"
              placeholder="Lý do từ chối"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              style={styles.rejectReasonInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectDialogVisible(false)}>Hủy</Button>
            <Button 
              onPress={executeReject} 
              color="#F44336"
              disabled={!rejectReason.trim()}
            >
              Từ chối
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
    paddingBottom: 16,
    height: 56 + (Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0),
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  editHeaderButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  detailsContainer: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  headerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogoContainer: {
    marginRight: 16,
  },
  companyLogo: {
    backgroundColor: '#E3F2FD',
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
    fontWeight: '500',
  },
  jobMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  contentCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  contentSurface: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDivider: {
    backgroundColor: '#E2E8F0',
    height: 1,
    marginBottom: 16,
  },
  detailsSection: {
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  requirementsSection: {
    marginBottom: 24,
  },
  requirementsText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  skillsSection: {
    marginBottom: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skillChip: {
    margin: 4,
    backgroundColor: '#E0F2FE',
  },
  skillChipText: {
    color: '#0369A1',
  },
  rejectReasonSection: {
    marginTop: 16,
  },
  rejectReasonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 8,
  },
  rejectReasonCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  rejectReasonText: {
    fontSize: 15,
    color: '#7F1D1D',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  approveButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    elevation: 2,
  },
  rejectButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 10,
    borderColor: '#F44336',
    borderWidth: 1.5,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 10,
    borderColor: '#1976D2',
    borderWidth: 1.5,
  },
  backToListButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#1976D2',
    elevation: 2,
  },
  editButtonLabel: {
    color: '#1976D2',
    fontWeight: '600',
  },
  actionButtonContent: {
    height: 48,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
  },
  rejectReasonInput: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  infoCard: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  infoCardDivider: {
    backgroundColor: '#E2E8F0',
    height: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoRowValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
});

export default JobDetail;