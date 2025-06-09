// src/screens/Admin/UserManagement/UserList.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  Dimensions, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  FlatList,
  Image
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
  Modal,
  Portal,
  Tooltip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

// Thẻ hiển thị vai trò người dùng với icons được cải thiện
const RoleChip = ({ role, isActive }) => {
  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Admin':
        return isActive ? ['#F44336', '#D32F2F'] : ['#FFCDD2', '#EF9A9A'];
      case 'Recruiter':
        return isActive ? ['#2196F3', '#1976D2'] : ['#BBDEFB', '#90CAF9'];
      case 'JobSeeker':
        return isActive ? ['#4CAF50', '#388E3C'] : ['#C8E6C9', '#A5D6A7'];
      default:
        return isActive ? ['#9E9E9E', '#757575'] : ['#EEEEEE', '#E0E0E0'];
    }
  };

  // Cải thiện icons của các vai trò
  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'Admin':
        return 'shield-account';
      case 'Recruiter':
        return 'account-tie';
      case 'JobSeeker':
        return 'account-search';
      default:
        return 'account-question';
    }
  };

  return (
    <LinearGradient
      colors={getRoleColor(role)}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[styles.roleChip, isActive && styles.activeRoleChip]}
    >
      <MaterialCommunityIcons 
        name={getRoleIcon(role)} 
        size={14} 
        color={isActive ? "#fff" : "#333"} 
      />
      <Text style={[styles.roleText, isActive ? styles.activeRoleText : styles.inactiveRoleText]}>
        {role}
      </Text>
    </LinearGradient>
  );
};

// Filter Modal Component - Sửa lỗi bộ lọc
const FilterModal = ({ visible, hideModal, filters, setFilters, applyFilters }) => {
  // Sử dụng useRef để lưu trữ trạng thái tạm thời của bộ lọc
  const [tempFilters, setTempFilters] = useState({...filters});

  // Reset tempFilters khi modal được mở
  useEffect(() => {
    if (visible) {
      setTempFilters({...filters});
    }
  }, [visible, filters]);

  const handleRoleSelect = (role) => {
    const newRoles = tempFilters.roles.includes(role)
      ? tempFilters.roles.filter(r => r !== role)
      : [...tempFilters.roles, role];
      
    setTempFilters(prev => ({
      ...prev,
      roles: newRoles
    }));
  };

  const handleStatusSelect = (status) => {
    setTempFilters(prev => ({
      ...prev,
      status
    }));
  };

  const handleSortSelect = (sortBy) => {
    setTempFilters(prev => ({
      ...prev,
      sortBy
    }));
  };

  const handleApply = () => {
    setFilters(tempFilters);
    applyFilters(tempFilters);
    hideModal();
  };

  const handleReset = () => {
    const resetFilters = {
      roles: [],
      status: 'all',
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
          <Text style={styles.filterSectionTitle}>Vai trò</Text>
          <View style={styles.filterChipGroup}>
            {[
              { value: 'Admin', icon: 'shield-account' },
              { value: 'Recruiter', icon: 'account-tie' },
              { value: 'JobSeeker', icon: 'account-search' }
            ].map(role => (
              <TouchableOpacity 
                key={role.value}
                onPress={() => handleRoleSelect(role.value)}
              >
                <Chip 
                  selected={tempFilters.roles.includes(role.value)}
                  selectedColor="#1976D2"
                  style={[
                    styles.filterChip,
                    tempFilters.roles.includes(role.value) && styles.selectedFilterChip
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons 
                      name={role.icon} 
                      size={18} 
                      color={tempFilters.roles.includes(role.value) ? "#1976D2" : "#666"} 
                    />
                  )}
                >
                  {role.value}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Trạng thái</Text>
          <View style={styles.filterChipGroup}>
            {[
              { value: 'all', label: 'Tất cả', icon: 'account-group' },
              { value: 'active', label: 'Đang hoạt động', icon: 'account-check' },
              { value: 'inactive', label: 'Đã khóa', icon: 'account-lock' }
            ].map(item => (
              <TouchableOpacity 
                key={item.value}
                onPress={() => handleStatusSelect(item.value)}
              >
                <Chip 
                  selected={tempFilters.status === item.value}
                  selectedColor="#1976D2"
                  style={[
                    styles.filterChip,
                    tempFilters.status === item.value && styles.selectedFilterChip
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons 
                      name={item.icon} 
                      size={18} 
                      color={tempFilters.status === item.value ? "#1976D2" : "#666"} 
                    />
                  )}
                >
                  {item.label}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
          <View style={styles.filterChipGroup}>
            {[
              { value: 'newest', label: 'Mới nhất', icon: 'sort-calendar-descending' },
              { value: 'oldest', label: 'Cũ nhất', icon: 'sort-calendar-ascending' },
              { value: 'name_asc', label: 'Tên (A-Z)', icon: 'sort-alphabetical-ascending' },
              { value: 'name_desc', label: 'Tên (Z-A)', icon: 'sort-alphabetical-descending' }
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
            icon="refresh"
          >
            Đặt lại
          </Button>
          <Button 
            mode="contained" 
            onPress={handleApply}
            style={styles.applyButton}
            icon="check"
          >
            Áp dụng
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

// Main UserList Component
const UserList = () => {
  const navigation = useNavigation();
  const { userToken } = useAuth();
  
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    roles: [],
    status: 'all',
    sortBy: 'newest'
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pendingRolesCount, setPendingRolesCount] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  // Fetch users with improved error handling
  const fetchUsers = async (newPage = 1, newFilters = filters) => {
    try {
      if (newPage === 1) {
        setLoading(true);
      }
      setError(null);
      
      const params = {
        search: searchQuery,
        page: newPage,
        page_size: 10
      };
      
      // Add role filter
      if (newFilters.roles && newFilters.roles.length > 0) {
        params.role = newFilters.roles.join(',');
      }
      
      // Add status filter
      if (newFilters.status !== 'all') {
        params.is_active = newFilters.status === 'active';
      }
      
      // Add sort option
      switch (newFilters.sortBy) {
        case 'newest':
          params.ordering = '-date_joined';
          break;
        case 'oldest':
          params.ordering = 'date_joined';
          break;
        case 'name_asc':
          params.ordering = 'username';
          break;
        case 'name_desc':
          params.ordering = '-username';
          break;
      }
      
      console.log('Fetching users with params:', params);
      const response = await adminAPI.getUsers(userToken, params);
      
      if (newPage === 1) {
        setUsers(response.results || []);
      } else {
        setUsers(prevUsers => [...prevUsers, ...(response.results || [])]);
      }
      
      setTotalUsers(response.count || 0);
      setHasMore(response.next !== null);
      setPage(newPage);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch pending roles count
  const fetchPendingRolesCount = async () => {
    try {
      const response = await adminAPI.getPendingRoles(userToken);
      setPendingRolesCount(response.length || 0);
    } catch (error) {
      console.error('Error fetching pending roles count:', error);
    }
  };

  // Load more users when scrolling to bottom
  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchUsers(page + 1);
    }
  };

  // Refresh user list
  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchUsers(1);
    fetchPendingRolesCount();
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchUsers(1);
  };

  // Apply filters - Sửa lỗi
  const applyFilters = (newFilters) => {
    console.log('Applying filters:', newFilters);
    setPage(1);
    fetchUsers(1, newFilters);
  };

  // Navigate to user detail
  const handleUserPress = (user) => {
    navigation.navigate('UserDetail', { userId: user.id });
  };

  // Navigate to pending roles
  const navigateToPendingRoles = () => {
    navigation.navigate('PendingRoles');
  };

  // Fetch users on initial load and when returning to screen
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
      fetchPendingRolesCount();
    }, [])
  );

  // Get avatar URL
  const getAvatarUrl = (url) => {
    if (!url) return null;
    return url.startsWith('/static') ? null : url;
  };

  // Render user item
  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)}>
      <Surface style={styles.userCard}>
        <View style={styles.userCardContent}>
          {getAvatarUrl(item.avatar_url) ? (
            <Image 
              source={{ uri: item.avatar_url }}
              style={styles.userAvatar}
              defaultSource={require('../../../../assets/default_avatar.png')}
            />
          ) : (
            <View style={[styles.userAvatarPlaceholder, { backgroundColor: getUserColor(item.username) }]}>
              <Text style={styles.userAvatarText}>
                {item.username ? item.username.substring(0, 2).toUpperCase() : '??'}
              </Text>
            </View>
          )}
          
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{item.username || 'N/A'}</Text>
              {item.active_role && (
                <Badge style={[styles.activeBadge, { backgroundColor: getRoleBadgeColor(item.active_role) }]}>
                  {getRoleBadgeInitial(item.active_role)}
                </Badge>
              )}
            </View>
            
            <Text style={styles.userEmail}>{item.email || 'Không có email'}</Text>
            
            {item.first_name && item.last_name && (
              <Text style={styles.userFullName}>
                {item.first_name} {item.last_name}
              </Text>
            )}
            
            <View style={styles.userRoles}>
              {item.roles && item.roles.map((role, index) => (
                <RoleChip 
                  key={index} 
                  role={role} 
                  isActive={role === item.active_role} 
                />
              ))}
            </View>
          </View>
          
          <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
        </View>
      </Surface>
    </TouchableOpacity>
  );

  // Tạo màu ngẫu nhiên dựa trên username
  const getUserColor = (username) => {
    if (!username) return '#1976D2';
    
    const colors = ['#1976D2', '#388E3C', '#D32F2F', '#7B1FA2', '#C2185B', '#F57C00', '#0097A7'];
    const sum = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  // Lấy màu tương ứng với vai trò
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return '#F44336';
      case 'Recruiter': return '#2196F3';
      case 'JobSeeker': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  // Lấy chữ cái đầu của vai trò
  const getRoleBadgeInitial = (role) => {
    switch (role) {
      case 'Admin': return 'A';
      case 'Recruiter': return 'R';
      case 'JobSeeker': return 'J';
      default: return '?';
    }
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity 
        style={styles.drawerButton}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <MaterialCommunityIcons name="menu" size={24} color="#1E3A8A" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Quản lý người dùng</Text>
      
      <Tooltip title="Danh sách vai trò chờ duyệt" enterTouchDelay={0}>
        <TouchableOpacity 
          style={styles.headerRightButton}
          onPress={navigateToPendingRoles}
        >
          <MaterialCommunityIcons name="account-multiple-check" size={24} color="#1E3A8A" />
          {pendingRolesCount > 0 && (
            <Badge style={styles.pendingRolesBadge}>{pendingRolesCount}</Badge>
          )}
        </TouchableOpacity>
      </Tooltip>
    </View>
  );

  // Render search bar được cải thiện
  const renderSearchBar = () => (
    <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
      <Searchbar
        placeholder="Tìm kiếm tên người dùng, email..."
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
        style={[styles.filterButton, (filters.roles.length > 0 || filters.status !== 'all') && styles.activeFilterButton]}
        onPress={() => setFilterModalVisible(true)}
      >
        <MaterialCommunityIcons 
          name="filter-variant" 
          size={24} 
          color={(filters.roles.length > 0 || filters.status !== 'all') ? "#1976D2" : "#757575"} 
        />
        {(filters.roles.length > 0 || filters.status !== 'all') && (
          <Badge style={styles.filterBadge}>
            {filters.roles.length + (filters.status !== 'all' ? 1 : 0)}
          </Badge>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render active filters
  const renderActiveFilters = () => {
    if (filters.roles.length === 0 && filters.status === 'all') return null;
    
    return (
      <View style={styles.activeFiltersContainer}>
        <View style={styles.activeFiltersHeader}>
          <Text style={styles.activeFiltersTitle}>Bộ lọc đang áp dụng:</Text>
          <TouchableOpacity onPress={() => {
            const resetFilters = {
              roles: [],
              status: 'all',
              sortBy: filters.sortBy
            };
            setFilters(resetFilters);
            applyFilters(resetFilters);
          }}>
            <Text style={styles.clearFiltersText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
          {filters.roles.map(role => (
            <Chip
              key={role}
              mode="outlined"
              onClose={() => {
                const newFilters = {
                  ...filters,
                  roles: filters.roles.filter(r => r !== role)
                };
                setFilters(newFilters);
                applyFilters(newFilters);
              }}
              style={styles.activeFilterChip}
              textStyle={{color: '#1976D2'}}
              icon={() => {
                const roleIcon = role === 'Admin' ? 'shield-account' : 
                               role === 'Recruiter' ? 'account-tie' : 'account-search';
                return <MaterialCommunityIcons name={roleIcon} size={16} color="#1976D2" />;
              }}
            >
              {role}
            </Chip>
          ))}
          
          {filters.status !== 'all' && (
            <Chip
              mode="outlined"
              onClose={() => {
                const newFilters = {
                  ...filters,
                  status: 'all'
                };
                setFilters(newFilters);
                applyFilters(newFilters);
              }}
              style={styles.activeFilterChip}
              textStyle={{color: '#1976D2'}}
              icon={() => {
                const statusIcon = filters.status === 'active' ? 'account-check' : 'account-lock';
                return <MaterialCommunityIcons name={statusIcon} size={16} color="#1976D2" />;
              }}
            >
              {filters.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
            </Chip>
          )}
        </ScrollView>
      </View>
    );
  };

  // Render stats
  const renderStats = () => (
    <Surface style={styles.statsCard}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalUsers}</Text>
          <Text style={styles.statLabel}>Tổng người dùng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {users.filter(user => user.active_role === 'Recruiter').length}
          </Text>
          <Text style={styles.statLabel}>Nhà tuyển dụng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {users.filter(user => user.active_role === 'JobSeeker').length}
          </Text>
          <Text style={styles.statLabel}>Ứng viên</Text>
        </View>
      </View>
    </Surface>
  );

  // Render error state
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#F44336" />
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
  };

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
              <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  colors={["#1976D2"]} 
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                hasMore && users.length > 0 ? (
                  <View style={styles.loadMoreContainer}>
                    <ActivityIndicator size="small" color="#1976D2" />
                    <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !loading ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="account-search" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
                    <Button 
                      mode="contained" 
                      onPress={onRefresh}
                      style={styles.retryButton}
                      icon="refresh"
                    >
                      Thử lại
                    </Button>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
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
    position: 'relative',
  },
  pendingRolesBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F44336',
  },
  contentContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 1,
  },
  searchContainerFocused: {
    backgroundColor: '#EEF2FF',
    borderBottomColor: '#1976D2',
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F7FA',
    height: 44,
    borderRadius: 22,
  },
  searchInput: {
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterButton: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#1976D2',
  },
  activeFiltersContainer: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#4B5563',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  activeFiltersScroll: {
    flexDirection: 'row',
  },
  activeFilterChip: {
    marginRight: 8,
    borderColor: '#BBDEFB',
    backgroundColor: '#E3F2FD',
  },
  statsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: '#fff',
  },
  userCardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  activeBadge: {
    height: 20,
    minWidth: 20,
    borderRadius: 10,
    fontSize: 10,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  userFullName: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
  },
  userRoles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  activeRoleChip: {
    elevation: 1,
  },
  roleText: {
    fontSize: 10,
    marginLeft: 4,
  },
  activeRoleText: {
    color: '#fff',
    fontWeight: '500',
  },
  inactiveRoleText: {
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#1976D2',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 24,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    padding: 16,
    maxHeight: height * 0.6,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 8,
  },
  filterChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterChip: {
    margin: 4,
  },
  selectedFilterChip: {
    backgroundColor: '#E3F2FD',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButton: {
    marginRight: 8,
    borderColor: '#1976D2',
  },
  applyButton: {
    backgroundColor: '#1976D2',
  },
});

export default UserList;