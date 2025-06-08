// src/screens/Admin/UserManagement/UserList.js
import React, { useState, useEffect } from 'react';
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
  Menu,
  IconButton,
  Badge,
  Modal,
  Portal
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

// Thẻ hiển thị vai trò người dùng
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

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'Admin':
        return 'shield-crown';
      case 'Recruiter':
        return 'briefcase';
      case 'JobSeeker':
        return 'account';
      default:
        return 'help-circle';
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

// Filter Modal Component
const FilterModal = ({ visible, hideModal, filters, setFilters, applyFilters }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleRoleSelect = (role) => {
    if (tempFilters.roles.includes(role)) {
      setTempFilters({
        ...tempFilters,
        roles: tempFilters.roles.filter(r => r !== role)
      });
    } else {
      setTempFilters({
        ...tempFilters,
        roles: [...tempFilters.roles, role]
      });
    }
  };

  const handleStatusSelect = (status) => {
    setTempFilters({
      ...tempFilters,
      status
    });
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
            {['Admin', 'Recruiter', 'JobSeeker'].map(role => (
              <TouchableOpacity 
                key={role}
                onPress={() => handleRoleSelect(role)}
              >
                <Chip 
                  selected={tempFilters.roles.includes(role)}
                  selectedColor="#1976D2"
                  style={[
                    styles.filterChip,
                    tempFilters.roles.includes(role) && styles.selectedFilterChip
                  ]}
                >
                  {role}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Trạng thái</Text>
          <View style={styles.filterChipGroup}>
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'inactive', label: 'Đã khóa' }
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
                >
                  {item.label}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
          <View style={styles.filterChipGroup}>
            {[
              { value: 'newest', label: 'Mới nhất' },
              { value: 'oldest', label: 'Cũ nhất' },
              { value: 'name_asc', label: 'Tên (A-Z)' },
              { value: 'name_desc', label: 'Tên (Z-A)' }
            ].map(item => (
              <TouchableOpacity 
                key={item.value}
                onPress={() => setTempFilters({...tempFilters, sortBy: item.value})}
              >
                <Chip 
                  selected={tempFilters.sortBy === item.value}
                  selectedColor="#1976D2"
                  style={[
                    styles.filterChip,
                    tempFilters.sortBy === item.value && styles.selectedFilterChip
                  ]}
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

// Main UserList Component
const UserList = () => {
  const navigation = useNavigation();
  const { userToken, userInfo } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchUsers = async (newPage = 1, newFilters = filters) => {
    try {
      if (newPage === 1) {
        setLoading(true);
      }
      
      const params = {
        search: searchQuery,
        page: newPage,
        page_size: 10
      };
      
      // Add role filter
      if (newFilters.roles.length > 0) {
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
      
      const response = await adminAPI.getUsers(userToken, params);
      
      if (newPage === 1) {
        setUsers(response.results);
      } else {
        setUsers(prevUsers => [...prevUsers, ...response.results]);
      }
      
      setTotalUsers(response.count);
      setHasMore(response.next !== null);
      setPage(newPage);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchUsers(page + 1);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchUsers(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1);
  };

  const applyFilters = (newFilters) => {
    setPage(1);
    fetchUsers(1, newFilters);
  };

  const handleUserPress = (user) => {
    navigation.navigate('UserDetail', { userId: user.id, user });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getAvatarUrl = (url) => {
    if (!url) return null;
    return url.startsWith('/static') ? null : url;
  };

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
            <View style={styles.userAvatarPlaceholder}>
              <Text style={styles.userAvatarText}>
                {item.username ? item.username.substring(0, 2).toUpperCase() : '??'}
              </Text>
            </View>
          )}
          
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{item.username || 'N/A'}</Text>
              {item.active_role && (
                <Badge style={styles.activeBadge}>
                  {item.active_role.substring(0, 1)}
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

  const renderHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity 
        style={styles.drawerButton}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <MaterialCommunityIcons name="menu" size={24} color="#1E3A8A" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Quản lý người dùng</Text>
      
      <TouchableOpacity 
        style={styles.headerRightButton}
        onPress={() => navigation.navigate('UserDetail', { userId: null })}
      >
        <MaterialCommunityIcons name="account-plus" size={24} color="#1E3A8A" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Tìm kiếm người dùng..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#1976D2"
      />
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <MaterialCommunityIcons name="filter-variant" size={24} color="#1976D2" />
        {(filters.roles.length > 0 || filters.status !== 'all') && (
          <Badge style={styles.filterBadge}>
            {filters.roles.length + (filters.status !== 'all' ? 1 : 0)}
          </Badge>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderActiveFilters = () => {
    if (filters.roles.length === 0 && filters.status === 'all') return null;
    
    return (
      <View style={styles.activeFiltersContainer}>
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
            >
              {filters.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
            </Chip>
          )}
        </ScrollView>
      </View>
    );
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {renderHeader()}
      
      <View style={styles.contentContainer}>
        {renderSearchBar()}
        {renderActiveFilters()}
        {renderStats()}
        
        {loading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
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
                  >
                    Thử lại
                  </Button>
                </View>
              ) : null
            }
          />
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
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F7FA',
    height: 40,
  },
  searchInput: {
    fontSize: 14,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#1976D2',
  },
  activeFiltersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activeFiltersScroll: {
    flexDirection: 'row',
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderColor: '#1976D2',
  },
  statsCard: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1F5FE',
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activeBadge: {
    backgroundColor: '#1976D2',
    marginLeft: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  userFullName: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  userRoles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  activeRoleChip: {
    elevation: 2,
  },
  roleText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeRoleText: {
    color: '#fff',
  },
  inactiveRoleText: {
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1976D2',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    marginLeft: 8,
    color: '#757575',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: height * 0.7,
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
    color: '#333',
  },
  modalContent: {
    padding: 16,
    maxHeight: height * 0.5,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  },
  applyButton: {
    backgroundColor: '#1976D2',
  },
});

export default UserList;