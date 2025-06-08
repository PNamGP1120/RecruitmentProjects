// src/screens/Admin/UserManagement/UserDetail.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image
} from 'react-native';
import { 
  Surface, 
  Text, 
  Avatar, 
  Divider, 
  List, 
  Button, 
  ActivityIndicator, 
  Badge,
  Portal,
  Dialog
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

// Component hiển thị vai trò
const RoleChip = ({ role, isActive }) => {
  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Admin':
        return isActive ? ['#F44336', '#D32F2F'] : ['#FFCDD2', '#EF9A9A'];
      case 'Recruiter':
      case 'Nhà tuyển dụng':
        return isActive ? ['#2196F3', '#1976D2'] : ['#BBDEFB', '#90CAF9'];
      case 'JobSeeker':
      case 'Người tìm việc':
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
      case 'Nhà tuyển dụng':
        return 'briefcase';
      case 'JobSeeker':
      case 'Người tìm việc':
        return 'account-search';
      default:
        return 'help-circle';
    }
  };

  // Chuyển đổi tên vai trò sang tiếng Anh để hiển thị nhất quán
  const getDisplayRole = (roleName) => {
    switch (roleName) {
      case 'Người tìm việc':
        return 'JobSeeker';
      case 'Nhà tuyển dụng':
        return 'Recruiter';
      default:
        return roleName;
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
        {getDisplayRole(role)}
      </Text>
    </LinearGradient>
  );
};

// Component chính
const UserDetail = ({ route }) => {
  const navigation = useNavigation();
  const { userId, user: initialUserData } = route.params || {};
  const { userToken } = useAuth();
  
  const [user, setUser] = useState(initialUserData || {});
  const [loading, setLoading] = useState(!initialUserData);
  const [savingStatus, setSavingStatus] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const userData = await adminAPI.getUserDetail(userToken, userId);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const toggleUserStatus = async () => {
    try {
      setSavingStatus(true);
      const userData = {
        ...user,
        is_active: !user.is_active
      };
      
      await adminAPI.updateUser(userToken, userId, userData);
      
      setUser(prev => ({ ...prev, is_active: !prev.is_active }));
      Alert.alert(
        'Thành công', 
        `Đã ${user.is_active ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản người dùng`
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      Alert.alert('Lỗi', `Không thể cập nhật trạng thái người dùng: ${error.message}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssignAdmin = async () => {
    try {
      setLoading(true);
      await adminAPI.assignAdmin(userToken, userId);
      fetchUserDetails();
      Alert.alert('Thành công', 'Đã gán quyền Admin cho người dùng');
    } catch (error) {
      console.error('Error assigning admin role:', error);
      Alert.alert('Lỗi', 'Không thể gán quyền Admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await adminAPI.deleteUser(userToken, userId);
      Alert.alert('Thành công', 'Đã xóa người dùng');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Lỗi', 'Không thể xóa người dùng');
      setLoading(false);
    }
  };

  const showConfirmationDialog = (action) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeConfirmAction = () => {
    setShowConfirmDialog(false);
    
    if (confirmAction === 'delete') {
      handleDeleteUser();
    } else if (confirmAction === 'admin') {
      handleAssignAdmin();
    } else if (confirmAction === 'toggle') {
      toggleUserStatus();
    }
  };

  // Kiểm tra xem avatar có phải là đường dẫn tĩnh không
  const getAvatarSource = (url) => {
    if (!url || url.includes('/static/')) {
      // Trả về null để sử dụng Avatar.Text thay thế
      return null;
    }
    return { uri: url };
  };

  // Render header component
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1E3A8A" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Chi tiết người dùng</Text>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => showConfirmationDialog('delete')}
      >
        <MaterialCommunityIcons name="delete" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading && !user.id) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {renderHeader()}
      
      <ScrollView style={styles.scrollView}>
        {/* Thông tin cơ bản */}
        <Surface style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {getAvatarSource(user.avatar_url) ? (
              <Image 
                source={getAvatarSource(user.avatar_url)}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text 
                size={80} 
                label={user.username ? user.username.substring(0, 2).toUpperCase() : '??'} 
                style={styles.avatar}
              />
            )}
            
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{user.username || 'N/A'}</Text>
              <Text style={styles.email}>{user.email || 'Không có email'}</Text>
              
              {user.active_role && (
                <View style={styles.activeRoleBadge}>
                  <MaterialCommunityIcons 
                    name={
                      user.active_role === 'Admin' ? 'shield-crown' : 
                      user.active_role === 'Recruiter' ? 'briefcase' : 'account-search'
                    } 
                    size={14} 
                    color="#fff" 
                  />
                  <Text style={styles.activeRoleText}>
                    {user.active_role}
                  </Text>
                </View>
              )}
            </View>
            
            <Badge 
              size={24} 
              style={[
                styles.statusBadge, 
                user.is_active ? styles.activeBadge : styles.inactiveBadge
              ]}
            >
              {user.is_active ? 
                <MaterialCommunityIcons name="check" size={16} color="#fff" /> : 
                <MaterialCommunityIcons name="close" size={16} color="#fff" />
              }
            </Badge>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.profileDetails}>
            <Text style={styles.sectionTitle}>Vai trò</Text>
            <View style={styles.roleChips}>
              {user.roles && user.roles.map((role, index) => (
                <RoleChip 
                  key={index} 
                  role={role} 
                  isActive={
                    user.active_role === 'JobSeeker' && role === 'Người tìm việc' ||
                    user.active_role === 'Recruiter' && role === 'Nhà tuyển dụng' ||
                    user.active_role === role
                  } 
                />
              ))}
            </View>
          </View>
        </Surface>
        
        {/* Thông tin cá nhân */}
        <Surface style={styles.detailCard}>
          <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
          <Divider style={styles.divider} />
          
          <List.Item
            title="Họ và tên"
            description={
              user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : 'Chưa cập nhật'
            }
            left={props => <List.Icon {...props} icon="account" color="#1976D2" />}
            style={styles.listItem}
          />
          <Divider style={styles.itemDivider} />
          
          <List.Item
            title="Email"
            description={user.email || 'Chưa cập nhật'}
            left={props => <List.Icon {...props} icon="email" color="#1976D2" />}
            style={styles.listItem}
          />
          <Divider style={styles.itemDivider} />
          
          <List.Item
            title="Tên đăng nhập"
            description={user.username || 'N/A'}
            left={props => <List.Icon {...props} icon="account-key" color="#1976D2" />}
            style={styles.listItem}
          />
        </Surface>
        
        {/* Trạng thái tài khoản */}
        <Surface style={styles.detailCard}>
          <Text style={styles.cardTitle}>Trạng thái tài khoản</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.statusContainer}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Trạng thái:</Text>
              <View style={[
                styles.statusValue, 
                user.is_active ? styles.activeStatus : styles.inactiveStatus
              ]}>
                <MaterialCommunityIcons 
                  name={user.is_active ? "check-circle" : "close-circle"} 
                  size={18} 
                  color={user.is_active ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.statusText,
                  user.is_active ? styles.activeStatusText : styles.inactiveStatusText
                ]}>
                  {user.is_active ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                </Text>
              </View>
            </View>
            
            <Button
              mode={user.is_active ? "outlined" : "contained"}
              onPress={() => showConfirmationDialog('toggle')}
              loading={savingStatus}
              icon={user.is_active ? "account-cancel" : "account-check"}
              style={user.is_active ? styles.deactivateButton : styles.activateButton}
              labelStyle={user.is_active ? styles.deactivateLabel : styles.activateLabel}
            >
              {user.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
            </Button>
          </View>
        </Surface>
        
        {/* Quản lý quyền */}
        <Surface style={styles.detailCard}>
          <Text style={styles.cardTitle}>Quản lý quyền</Text>
          <Divider style={styles.divider} />
          
          {!user.roles?.includes('Admin') && (
            <Button
              mode="contained"
              icon="shield-crown"
              onPress={() => showConfirmationDialog('admin')}
              style={styles.assignAdminButton}
              labelStyle={styles.assignAdminLabel}
            >
              Gán quyền Admin
            </Button>
          )}
          
          {user.roles?.includes('Admin') && (
            <View style={styles.adminInfoContainer}>
              <MaterialCommunityIcons name="shield-crown" size={24} color="#D32F2F" />
              <Text style={styles.adminInfoText}>
                Người dùng này đã có quyền Admin
              </Text>
            </View>
          )}
          
          <View style={styles.adminActionContainer}>
            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => navigation.navigate('UserEdit', { userId: user.id })}
              style={styles.editButton}
            >
              Chỉnh sửa thông tin
            </Button>
            
            <Button
              mode="outlined"
              icon="delete"
              onPress={() => showConfirmationDialog('delete')}
              style={styles.deleteButton}
              labelStyle={styles.deleteButtonLabel}
            >
              Xóa người dùng
            </Button>
          </View>
        </Surface>
      </ScrollView>
      
      {/* Dialog xác nhận */}
      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
          <Dialog.Title>
            {confirmAction === 'delete' ? 'Xác nhận xóa' : 
             confirmAction === 'admin' ? 'Xác nhận gán quyền Admin' : 
             user.is_active ? 'Xác nhận vô hiệu hóa' : 'Xác nhận kích hoạt'}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              {confirmAction === 'delete' ? 
                `Bạn có chắc chắn muốn xóa người dùng ${user.username || ''}? Hành động này không thể hoàn tác.` : 
               confirmAction === 'admin' ? 
                `Bạn có chắc chắn muốn gán quyền Admin cho ${user.username || ''}?` : 
               user.is_active ? 
                `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của ${user.username || ''}? Người dùng sẽ không thể đăng nhập vào hệ thống.` : 
                `Bạn có chắc chắn muốn kích hoạt tài khoản của ${user.username || ''}?`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Hủy</Button>
            <Button 
              mode="contained" 
              onPress={executeConfirmAction}
              style={
                confirmAction === 'delete' ? styles.confirmDeleteButton : 
                confirmAction === 'toggle' && user.is_active ? styles.confirmDeactivateButton :
                styles.confirmButton
              }
            >
              Xác nhận
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
    backgroundColor: '#F1F5F9',
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  header: {
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
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
    fontSize: 16,
  },
  profileCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1976D2',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  activeRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  activeRoleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: '#F44336',
  },
  divider: {
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  profileDetails: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  activeRoleChip: {
    elevation: 2,
  },
  roleText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  activeRoleText: {
    color: '#fff',
  },
  inactiveRoleText: {
    color: '#333',
  },
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: '#fff',
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  itemDivider: {
    backgroundColor: '#E5E7EB',
    height: 1,
  },
  listItem: {
    paddingVertical: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeStatus: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  inactiveStatus: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeStatusText: {
    color: '#2E7D32',
  },
  inactiveStatusText: {
    color: '#C62828',
  },
  deactivateButton: {
    borderColor: '#F44336',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  deactivateLabel: {
    color: '#F44336',
  },
  activateLabel: {
    color: '#fff',
  },
  assignAdminButton: {
    backgroundColor: '#D32F2F',
    marginVertical: 8,
  },
  assignAdminLabel: {
    color: '#fff',
  },
  adminInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  adminInfoText: {
    marginLeft: 8,
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '500',
  },
  adminActionContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#1976D2',
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#F44336',
  },
  deleteButtonLabel: {
    color: '#F44336',
  },
  dialogText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  confirmButton: {
    backgroundColor: '#1976D2',
  },
  confirmDeleteButton: {
    backgroundColor: '#F44336',
  },
  confirmDeactivateButton: {
    backgroundColor: '#F44336',
  },
});

export default UserDetail;