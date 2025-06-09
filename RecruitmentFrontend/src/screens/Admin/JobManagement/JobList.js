// src/screens/Admin/JobManagement/JobList.js
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
  Divider,
  Surface,
  Avatar,
  Searchbar,
  Chip,
  Button,
  IconButton,
  Badge,
  Portal,
  Dialog,
  Modal,
  Tooltip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, DrawerActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

// Status Chip Component
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

// Filter Modal Component
const FilterModal = ({ visible, hideModal, filters, setFilters, applyFilters }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  // Reset tempFilters when modal is opened
  React.useEffect(() => {
    setTempFilters({ ...filters });
  }, [visible, filters]);

  const handleStatusSelect = (status) => {
    if (tempFilters.statuses.includes(status)) {
      setTempFilters({
        ...tempFilters,
        statuses: tempFilters.statuses.filter(s => s !== status)
      });
    } else {
      setTempFilters({
        ...tempFilters,
        statuses: [...tempFilters.statuses, status]
      });
    }
  };

  const handleSortSelect = (sortBy) => {
    setTempFilters({
      ...tempFilters,
      sortBy
    });
  };

  const handleApply = () => {
    setFilters(tempFilters);
    applyFilters(tempFilters);
    hideModal();
  };

  const handleReset = () => {
    const resetFilters = {
      statuses: [],
      sortBy: 'newest'
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    applyFilters(resetFilters);
    hideModal();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Tùy chọn lọc</Text>
          <IconButton icon="close" size={20} onPress={hideModal} />
        </View>
        <Divider />

        <ScrollView style={styles.modalContent}>
          <Text style={styles.filterSectionTitle}>Trạng thái</Text>
          <View style={styles.filterChipGroup}>
            {[
              { value: 'Approved', label: 'Đã duyệt', icon: 'check-circle' },
              { value: 'Pending', label: 'Chờ duyệt', icon: 'clock-outline' },
              { value: 'Rejected', label: 'Đã từ chối', icon: 'close-circle' },
              { value: 'Draft', label: 'Bản nháp', icon: 'file-outline' },
              { value: 'Expired', label: 'Hết hạn', icon: 'calendar-remove' }
            ].map(status => (
              <TouchableOpacity
                key={status.value}
                onPress={() => handleStatusSelect(status.value)}
              >
                <Chip
                  selected={tempFilters.statuses.includes(status.value)}
                  selectedColor="#1976D2"
                  style={[
                    styles.filterChip,
                    tempFilters.statuses.includes(status.value) && styles.selectedFilterChip
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons
                      name={status.icon}
                      size={18}
                      color={tempFilters.statuses.includes(status.value) ? "#1976D2" : "#666"}
                    />
                  )}
                >
                  {status.label}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
          <View style={styles.filterChipGroup}>
            {[
              { value: 'newest', label: 'Mới nhất', icon: 'sort-calendar-descending' },
              { value: 'oldest', label: 'Cũ nhất', icon: 'sort-calendar-ascending' },
              { value: 'salary_high', label: 'Lương cao nhất', icon: 'sort-numeric-descending' },
              { value: 'salary_low', label: 'Lương thấp nhất', icon: 'sort-numeric-ascending' }
            ].map(item => (
              <TouchableOpacity
                key={item.value}
                onPress={() => handleSortSelect(item.value)}
              >
                <Chip
                  selected={tempFilters.sortBy === item.value}
                  selectedColor="#1976D2"
                  style={[
                    styles.filterChip,
                    tempFilters.sortBy === item.value && styles.selectedFilterChip
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={18}
                      color={tempFilters.sortBy === item.value ? "#1976D2" : "#666"}
                    />
                  )}
                >
                  {item.label}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Divider />
        <View style={styles.modalFooter}>
          <Button
            mode="outlined"
            onPress={handleReset}
            style={styles.resetButton}
          >
            Đặt lại
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.applyButton}
          >
            Áp dụng
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

// Confirm Dialog Component
const ConfirmDialog = ({ visible, onDismiss, title, message, onConfirm, confirmText, confirmColor }) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <Text>{message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Hủy</Button>
        <Button
          mode="contained"
          onPress={onConfirm}
          color={confirmColor || "#1976D2"}
        >
          {confirmText || "Xác nhận"}
        </Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);

const JobList = () => {
  const navigation = useNavigation();

  // Lấy token từ context xác thực
  const { userToken } = useAuth();

  // State variables
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [filters, setFilters] = useState({
    statuses: [],
    sortBy: 'newest'
  });

  // Dialog states
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // Fetch jobs from API
  const fetchJobs = async (newPage = 1, newFilters = filters) => {
    try {
      if (newPage === 1) {
        setLoading(true);
      }

      // Kiểm tra token trước khi gọi API
      if (!userToken) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Convert sort values to API parameters
      let sortParams = {};
      if (newFilters.sortBy === 'newest') {
        sortParams = { sort_by: 'created_at', order: 'desc' };
      } else if (newFilters.sortBy === 'oldest') {
        sortParams = { sort_by: 'created_at', order: 'asc' };
      } else if (newFilters.sortBy === 'salary_high') {
        sortParams = { sort_by: 'salary_min', order: 'desc' };
      } else if (newFilters.sortBy === 'salary_low') {
        sortParams = { sort_by: 'salary_min', order: 'asc' };
      }

      // Prepare status filter
      let statusFilter = {};
      if (newFilters.statuses.length > 0) {
        statusFilter = { status: newFilters.statuses.join(',') };
      }

      const response = await adminAPI.getPendingJobs(userToken, {
        page: newPage,
        limit: 10,
        search: searchQuery,
        ...sortParams,
        ...statusFilter
      });

      // Format the API response properly
      const jobsData = response.data || response.results || response || [];
      const total = response.count || response.total || jobsData.length;

      setTotalJobs(total);

      if (newPage === 1) {
        setJobs(jobsData);
      } else {
        setJobs(prevJobs => [...prevJobs, ...jobsData]);
      }

      setHasMore(jobsData.length === 10);
      setError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Không thể tải danh sách việc làm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch jobs on initial load and when returning to screen
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchJobs(1, filters);
    }, [searchQuery, filters, userToken])
  );

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage, filters);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    fetchJobs(1, filters);
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchJobs(1, filters);
  };

  // Apply filters
  const applyFilters = (newFilters) => {
    setPage(1);
    fetchJobs(1, newFilters);
  };

  // Handle job approval
  const handleApprove = (job) => {
    setConfirmData(job);
    setConfirmAction('approve');
    setConfirmDialogVisible(true);
  };

  // Handle job rejection
  const handleReject = (job) => {
    setConfirmData(job);
    setConfirmAction('reject');
    setConfirmDialogVisible(true);
  };

  // Confirm action execution
  const executeConfirmAction = async () => {
    if (!confirmData || !confirmAction) return;

    try {
      if (!userToken) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setConfirmDialogVisible(false);
        return;
      }

      if (confirmAction === 'approve') {
        await adminAPI.approveJob(userToken, confirmData.slug);
      } else if (confirmAction === 'reject') {
        await adminAPI.rejectJob(userToken, confirmData.slug, { reason: 'Từ chối bởi quản trị viên' });
      }

      onRefresh();
    } catch (error) {
      console.error(`Error ${confirmAction}ing job:`, error);
      setError(`Không thể ${confirmAction === 'approve' ? 'duyệt' : 'từ chối'} việc làm.`);
    } finally {
      setConfirmDialogVisible(false);
      setConfirmData(null);
      setConfirmAction(null);
    }
  };

  // Format salary range for display
  const formatSalary = (min, max, currency = 'VND') => {
    if (!min && !max) return 'Thương lượng';
    if (!min) return `Tối đa ${max.toLocaleString()} ${currency}`;
    if (!max) return `Tối thiểu ${min.toLocaleString()} ${currency}`;
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Render job item
  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('JobDetail', { slug: item.slug })}
    >
      <Surface style={styles.jobCard} elevation={2}>
        <View style={styles.jobCardContent}>
          <View style={styles.jobCardHeader}>
            {item.company_logo ? (
              <Avatar.Image
                size={56}
                source={{ uri: item.company_logo }}
                style={styles.companyLogo}
              />
            ) : (
              <Avatar.Text
                size={56}
                label={(item.company_name || "JO").substring(0, 2).toUpperCase()}
                style={styles.companyLogo}
                labelStyle={{ color: '#1976D2' }}
                color="#E3F2FD"
              />
            )}

            <View style={styles.jobTitleContainer}>
              <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.companyName} numberOfLines={1}>
                {item.company_name || 'Công ty'}
              </Text>
            </View>

            <StatusChip status={item.status} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.jobDetailsContainer}>
            <View style={styles.jobDetailRow}>
              <View style={styles.jobDetailItem}>
                <MaterialCommunityIcons name="map-marker-outline" size={18} color="#757575" />
                <Text style={styles.jobDetailText} numberOfLines={1}>
                  {item.location || 'Không có địa điểm'}
                </Text>
              </View>

              <View style={styles.jobDetailItem}>
                <MaterialCommunityIcons name="calendar-range" size={18} color="#757575" />
                <Text style={styles.jobDetailText} numberOfLines={1}>
                  Hạn: {formatDate(item.expiration_date)}
                </Text>
              </View>
            </View>

            <View style={styles.jobDetailRow}>
              <View style={styles.jobDetailItem}>
                <MaterialCommunityIcons name="currency-usd" size={18} color="#757575" />
                <Text style={styles.jobDetailText} numberOfLines={1}>
                  {formatSalary(item.salary_min, item.salary_max)}
                </Text>
              </View>

              <View style={styles.jobDetailItem}>
                <MaterialCommunityIcons name="briefcase-outline" size={18} color="#757575" />
                <Text style={styles.jobDetailText} numberOfLines={1}>
                  {item.job_type || 'Toàn thời gian'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.jobStats}>
            <View style={styles.jobStatItem}>
              <MaterialCommunityIcons name="eye-outline" size={16} color="#64748B" />
              <Text style={styles.jobStatText}>{item.views_count || 0} lượt xem</Text>
            </View>

            <View style={styles.jobStatItem}>
              <MaterialCommunityIcons name="account-outline" size={16} color="#64748B" />
              <Text style={styles.jobStatText}>{item.applications_count || 0} ứng viên</Text>
            </View>

            <View style={styles.jobStatItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
              <Text style={styles.jobStatText}>Đăng: {formatDate(item.created_at)}</Text>
            </View>
          </View>

          {item.status === 'Pending' && (
            <View style={styles.jobActions}>
              <Button
                mode="contained"
                icon="check-circle"
                onPress={(e) => {
                  e.stopPropagation();
                  handleApprove(item);
                }}
                style={styles.approveButton}
                contentStyle={styles.actionButtonContent}
                labelStyle={styles.actionButtonLabel}
              >
                Duyệt
              </Button>
              <Button
                mode="outlined"
                icon="close-circle"
                onPress={(e) => {
                  e.stopPropagation();
                  handleReject(item);
                }}
                style={styles.rejectButton}
                contentStyle={styles.actionButtonContent}
                labelStyle={styles.rejectButtonLabel}
              >
                Từ chối
              </Button>
            </View>
          )}

          {item.status !== 'Pending' && (
            <View style={styles.jobActions}>
              <Button
                mode="outlined"
                icon="pencil-outline"
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('JobEdit', { slug: item.slug });
                }}
                style={styles.editButton}
                contentStyle={styles.actionButtonContent}
                labelStyle={styles.editButtonLabel}
              >
                Chỉnh sửa
              </Button>
              <Button
                mode="outlined"
                icon="eye-outline"
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('JobDetail', { slug: item.slug });
                }}
                style={styles.viewButton}
                contentStyle={styles.actionButtonContent}
                labelStyle={styles.viewButtonLabel}
              >
                Xem chi tiết
              </Button>
            </View>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity
        style={styles.drawerButton}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <MaterialCommunityIcons name="menu" size={24} color="#1E3A8A" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Quản lý việc làm</Text>

      <Tooltip title="Làm mới danh sách" enterTouchDelay={0}>
        <TouchableOpacity
          style={styles.headerRightButton}
          onPress={onRefresh}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </Tooltip>
    </View>
  );

  // Render search bar
  const renderSearchBar = () => (
    <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
      <Searchbar
        placeholder="Tìm kiếm việc làm..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#1976D2"
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        placeholderTextColor="#9E9E9E"
        clearButtonMode="while-editing"
        theme={{ colors: { primary: '#1976D2' } }}
        selectionColor="rgba(25, 118, 210, 0.2)"
      />
      <TouchableOpacity
        style={[styles.filterButton, filters.statuses.length > 0 && styles.activeFilterButton]}
        onPress={() => setFilterModalVisible(true)}
      >
        <MaterialCommunityIcons
          name="filter-variant"
          size={24}
          color={filters.statuses.length > 0 ? "#1976D2" : "#757575"}
        />
        {filters.statuses.length > 0 && (
          <Badge style={styles.filterBadge}>
            {filters.statuses.length}
          </Badge>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render active filters
  const renderActiveFilters = () => {
    if (filters.statuses.length === 0) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <View style={styles.activeFiltersHeader}>
          <Text style={styles.activeFiltersTitle}>Bộ lọc đang áp dụng:</Text>
          <TouchableOpacity onPress={() => {
            const resetFilters = {
              statuses: [],
              sortBy: filters.sortBy
            };
            setFilters(resetFilters);
            applyFilters(resetFilters);
          }}>
            <Text style={styles.clearFiltersText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
          {filters.statuses.map(status => {
            const statusInfo = {
              'Approved': { label: 'Đã duyệt', icon: 'check-circle' },
              'Pending': { label: 'Chờ duyệt', icon: 'clock-outline' },
              'Rejected': { label: 'Đã từ chối', icon: 'close-circle' },
              'Draft': { label: 'Bản nháp', icon: 'file-outline' },
              'Expired': { label: 'Hết hạn', icon: 'calendar-remove' }
            }[status] || { label: status, icon: 'help-circle' };

            return (
              <Chip
                key={status}
                mode="outlined"
                onClose={() => {
                  const newFilters = {
                    ...filters,
                    statuses: filters.statuses.filter(s => s !== status)
                  };
                  setFilters(newFilters);
                  applyFilters(newFilters);
                }}
                style={styles.activeFilterChip}
                textStyle={{ color: '#1976D2' }}
                icon={() => <MaterialCommunityIcons name={statusInfo.icon} size={16} color="#1976D2" />}
              >
                {statusInfo.label}
              </Chip>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Render stats card
  const renderStats = () => {
    // Calculate stats from job data
    const pendingCount = jobs.filter(job => job.status === 'Pending').length;
    const approvedCount = jobs.filter(job => job.status === 'Approved').length;
    const rejectedCount = jobs.filter(job => job.status === 'Rejected').length;

    return (
      <Surface style={styles.statsCard} elevation={2}>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => {
              const newFilters = { ...filters, statuses: [] };
              setFilters(newFilters);
              applyFilters(newFilters);
            }}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="briefcase-outline" size={24} color="#1976D2" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statCount}>{totalJobs}</Text>
              <Text style={styles.statLabel}>Tổng tin</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => {
              const newFilters = { ...filters, statuses: ['Pending'] };
              setFilters(newFilters);
              applyFilters(newFilters);
            }}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF8E1' }]}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#FFC107" />
            </View>
            <View style={styles.statInfo}>
              <Text style={[styles.statCount, { color: '#FFC107' }]}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Chờ duyệt</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => {
              const newFilters = { ...filters, statuses: ['Approved'] };
              setFilters(newFilters);
              applyFilters(newFilters);
            }}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.statInfo}>
              <Text style={[styles.statCount, { color: '#4CAF50' }]}>{approvedCount}</Text>
              <Text style={styles.statLabel}>Đã duyệt</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => {
              const newFilters = { ...filters, statuses: ['Rejected'] };
              setFilters(newFilters);
              applyFilters(newFilters);
            }}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="close-circle" size={24} color="#F44336" />
            </View>
            <View style={styles.statInfo}>
              <Text style={[styles.statCount, { color: '#F44336' }]}>{rejectedCount}</Text>
              <Text style={styles.statLabel}>Từ chối</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Surface>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#BDBDBD" />
      <Text style={styles.emptyStateTitle}>Không có tin tuyển dụng</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery
          ? `Không tìm thấy kết quả cho "${searchQuery}"`
          : filters.statuses.length > 0
            ? "Không có tin tuyển dụng phù hợp với bộ lọc"
            : "Chưa có tin tuyển dụng nào được tạo"}
      </Text>
      <Button
        mode="contained"
        onPress={onRefresh}
        style={styles.retryButton}
        icon="refresh"
      >
        Làm mới
      </Button>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={80}
        color="#F44336" />
      <Text style={styles.errorText}>{error}</Text>
      <Button
        mode="contained"
        onPress={onRefresh}
        style={styles.retryButton}
        icon="refresh"
      >
        Thử lại
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {renderHeader()}

      <View style={styles.contentContainer}>
        {renderSearchBar()}
        {renderActiveFilters()}
        {renderStats()}

        {error ? renderError() : (
          loading && page === 1 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Đang tải danh sách việc làm...</Text>
            </View>
          ) : (
            <FlatList
              data={jobs}
              keyExtractor={(item) => item.id?.toString() || item.slug || Math.random().toString()}
              renderItem={renderJobItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyState}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#1976D2"]}
                  tintColor="#1976D2"
                />
              }
              ListFooterComponent={
                loading && page > 1 ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color="#1976D2" />
                    <Text style={styles.footerLoaderText}>Đang tải thêm...</Text>
                  </View>
                ) : null
              }
            />
          )
        )}
      </View>

      <FilterModal
        visible={filterModalVisible}
        hideModal={() => setFilterModalVisible(false)}
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
      />

      <ConfirmDialog
        visible={confirmDialogVisible}
        onDismiss={() => setConfirmDialogVisible(false)}
        title={confirmAction === 'approve' ? 'Duyệt tin tuyển dụng' : 'Từ chối tin tuyển dụng'}
        message={confirmAction === 'approve'
          ? 'Bạn có chắc chắn muốn duyệt tin tuyển dụng này?'
          : 'Bạn có chắc chắn muốn từ chối tin tuyển dụng này?'}
        onConfirm={executeConfirmAction}
        confirmText={confirmAction === 'approve' ? 'Duyệt' : 'Từ chối'}
        confirmColor={confirmAction === 'approve' ? '#4CAF50' : '#F44336'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: STATUSBAR_HEIGHT,
  },
  customHeader: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  drawerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  headerRightButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainerFocused: {
    borderBottomColor: '#1976D2',
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    height: 48,
  },
  searchInput: {
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#E3F2FD',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#1976D2',
  },
  activeFiltersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  activeFiltersScroll: {
    flexDirection: 'row',
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  statsCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statInfo: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Phần styles cho thẻ card job
  jobCard: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  jobCardContent: {
    padding: 16,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  companyLogo: {
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#F5F7FA',
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 22,
  },
  companyName: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
    elevation: 1,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 14,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  jobDetailsContainer: {
    marginBottom: 14,
  },
  jobDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 3,
  },
  jobDetailText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    fontWeight: '500',
  },
  jobStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 4,
  },
  jobStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  jobStatText: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
    fontWeight: '500',
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  approveButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    elevation: 1,
  },
  rejectButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#F44336',
    borderRadius: 10,
  },
  rejectButtonLabel: {
    color: '#F44336',
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#1976D2',
    borderRadius: 10,
  },
  editButtonLabel: {
    color: '#1976D2',
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#1976D2',
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
  },
  viewButtonLabel: {
    color: '#1976D2',
    fontWeight: '600',
  },
  actionButtonContent: {
    height: 44,
  },
  actionButtonLabel: {
    fontSize: 14,
    letterSpacing: 0.25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#616161',
    marginTop: 12,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  modalContent: {
    padding: 16,
    maxHeight: height * 0.6,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 12,
    marginTop: 8,
  },
  filterChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterChip: {
    margin: 4,
    backgroundColor: '#F5F5F5',
  },
  selectedFilterChip: {
    backgroundColor: '#E3F2FD',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  resetButton: {
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#1976D2',
  },
});

export default JobList;