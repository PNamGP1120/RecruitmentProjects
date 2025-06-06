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
  Switch, 
  Button, 
  ActivityIndicator, 
  Chip,
  IconButton,
  Menu,
  Badge,
  Portal,
  Dialog,
  Checkbox
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

// Component hiển thị vai trò
const RoleChip = ({ role, isActive, onPress }) => {
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
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
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
    </TouchableOpacity>
  );
};

// Component hiển thị yêu cầu vai trò chờ duyệt
const PendingRoleItem = ({ role, onApprove, onReject, loading }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Admin': return '#F44336';
      case 'Recruiter': return '#2196F3';
      case 'JobSeeker': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'Admin': return 'shield-crown';
      case 'Recruiter': return 'briefcase';
      case 'JobSeeker': return 'account';
      default: return 'help-circle';
    }
  };

  return (
    <Surface style={styles.pendingRoleCard}>
      <View style={styles.pendingRoleHeader}>
        <View style={styles.pendingRoleIcon}>
          <MaterialCommunityIcons 
            name={getRoleIcon(role.role)} 
            size={24} 
            color="#fff"
          />
        </View>
        <View style={styles.pendingRoleInfo}>
          <Text style={styles.pendingRoleTitle}>
            Yêu cầu vai trò <Text style={{color: getRoleColor(role.role), fontWeight: 'bold'}}>{role.role}</Text>
          </Text>
          <Text style={styles.pendingRoleDate}>
            Ngày yêu cầu: {formatDate(role.created_at)}
          </Text>
        </View>
        <IconButton 
          icon={expanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          onPress={() => setExpanded(!expanded)} 
        />
      </View>

      {expanded && (
        <View style={styles.pendingRoleDetails}>
          <Divider style={styles.divider} />
          
          {role.request_details && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lý do yêu cầu:</Text>
              <Text style={styles.detailValue}>{role.request_details}</Text>
            </View>
          )}
          
          {role.company_name && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tên công ty:</Text>
              <Text style={styles.detailValue}>{role.company_name}</Text>
            </View>
          )}
          
          {role.company_position && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Chức vụ:</Text>
              <Text style={styles.detailValue}>{role.company_position}</Text>
            </View>
          )}
          
          {role.verification_document && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tài liệu xác thực:</Text>
              <TouchableOpacity style={styles.documentLink}>
                <MaterialCommunityIcons name="file-document" size={16} color="#1976D2" />
                <Text style={styles.documentLinkText}>Xem tài liệu</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <Button 
              mode="outlined" 
              onPress={onReject}
              style={[styles.actionButton, styles.rejectButton]}
              labelStyle={{color: '#F44336'}}
              icon="close"
              disabled={loading}
            >
              Từ chối
            </Button>
            <Button 
              mode="contained" 
              onPress={onApprove}
              style={[styles.actionButton, styles.approveButton]}
              loading={loading}
              icon="check"
              disabled={loading}
            >
              Phê duyệt
            </Button>
          </View>
        </View>
      )}
    </Surface>
  );
};

// Component chính
const UserDetail = ({ route }) => {
  const navigation = useNavigation();
  const { userId, user: initialUserData } = route.params || {};
  const { userToken } = useAuth();
  
  const [user, setUser] = useState(initialUserData || {});
  const [loading, setLoading] = useState(!initialUserData);
  const [pendingRoles, setPendingRoles] = useState([]);
  const [savingStatus, setSavingStatus] = useState(false);
  const [processingRole, setProcessingRole] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [bulkApproveMode, setBulkApproveMode] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const userData = await adminAPI.getUserDetail(userToken, userId);
      setUser(userData);
      
      // Fetch pending roles for this user
      const allPendingRoles = await adminAPI.getPendingRoles(userToken);
      const userPendingRoles = allPendingRoles.filter(role => 
        role.user_id === userId && !role.is_approved
      );
      setPendingRoles(userPendingRoles);
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
      await adminAPI.updateUser(userToken, userId, { is_active: !user.is_active });
      setUser(prev => ({ ...prev, is_active: !prev.is_active }));
      Alert.alert(
        'Thành công', 
        `Đã ${user.is_active ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản người dùng`
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái người dùng');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleApproveRole = async (roleId) => {
    try {
      setProcessingRole(roleId);
      await adminAPI.approveRole(userToken, [roleId]);
      
      // Cập nhật danh sách vai trò chờ duyệt
      setPendingRoles(prev => prev.filter(role => role.id !== roleId));
      
      // Cập nhật thông tin người dùng
      fetchUserDetails();
      
      Alert.alert('Thành công', 'Đã phê duyệt vai trò cho người dùng');
    } catch (error) {
      console.error('Error approving role:', error);
      Alert.alert('Lỗi', 'Không thể phê duyệt vai trò');
    } finally {
      setProcessingRole(null);
    }
  };

  const handleRejectRole = (roleId) => {
    setCurrentRoleId(roleId);
    setShowRejectDialog(true);
  };

  const confirmRejectRole = async () => {
    try {
      setProcessingRole(currentRoleId);
      // Gọi API từ chối vai trò (cần bổ sung vào admin.js)
      // await adminAPI.rejectRole(userToken, currentRoleId, rejectReason);
      
      // Cập nhật danh sách vai trò chờ duyệt
      setPendingRoles(prev => prev.filter(role => role.id !== currentRoleId));
      
      setShowRejectDialog(false);
      setRejectReason('');
      setCurrentRoleId(null);
      
      Alert.alert('Thành công', 'Đã từ chối yêu cầu vai trò');
    } catch (error) {
      console.error('Error rejecting role:', error);
      Alert.alert('Lỗi', 'Không thể từ chối vai trò');
    } finally {
      setProcessingRole(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRoles.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một vai trò để phê duyệt');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.approveRole(userToken, selectedRoles);
      
      // Cập nhật danh sách vai trò chờ duyệt
      setPendingRoles(prev => prev.filter(role => !selectedRoles.includes(role.id)));
      
      // Reset chế độ chọn nhiều
      setBulkApproveMode(false);
      setSelectedRoles([]);
      
      // Cập nhật thông tin người dùng
      fetchUserDetails();
      
      Alert.alert('Thành công', `Đã phê duyệt ${selectedRoles.length} vai trò cho người dùng`);
    } catch (error) {
      console.error('Error bulk approving roles:', error);
      Alert.alert('Lỗi', 'Không thể phê duyệt các vai trò đã chọn');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoleSelection = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    } else {
      setSelectedRoles(prev => [...prev, roleId]);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    return url.startsWith('/static') ? null : url;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1E3A8A" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Chi tiết người dùng</Text>
      
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#1E3A8A" />
          </TouchableOpacity>
        }
      >
        <Menu.Item 
          onPress={() => {
            setMenuVisible(false);
            // Thêm xử lý chỉnh sửa người dùng
          }} 
          title="Chỉnh sửa" 
          leadingIcon="pencil"
        />
        <Menu.Item 
          onPress={() => {
            setMenuVisible(false);
            Alert.alert(
              'Xác nhận xóa',
              'Bạn có chắc chắn muốn xóa người dùng này?',
              [
                { text: 'Hủy', style: 'cancel' },
                { 
                  text: 'Xóa', 
                  onPress: async () => {
                    try {
                      await adminAPI.deleteUser(userToken, userId);
                      Alert.alert('Thành công', 'Đã xóa người dùng');
                      navigation.goBack();
                    } catch (error) {
                      Alert.alert('Lỗi', 'Không thể xóa người dùng');
                    }
                  },
                  style: 'destructive'
                }
              ]
            );
          }} 
          title="Xóa người dùng" 
          leadingIcon="delete"
        />
      </Menu>
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
            {getAvatarUrl(user.avatar_url) ? (
              <Image 
                source={{ uri: user.avatar_url }}
                style={styles.avatar}
                defaultSource={require('../../../../assets/default_avatar.png')}
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
                      user.active_role === 'Recruiter' ? 'briefcase' : 'account'
                    } 
                    size={14} 
                    color="#fff" 
                  />
                  <Text style={styles.activeRoleText}>{user.active_role}</Text>
                </View>
              )}
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.profileDetails}>
            <Text style={styles.sectionTitle}>Vai trò</Text>
            <View style={styles.roleChips}>
              {user.roles && user.roles.map((role, index) => (
                <RoleChip 
                  key={index} 
                  role={role} 
                  isActive={role === user.active_role} 
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
          />
          <Divider style={styles.itemDivider} />
          
          <List.Item
            title="Số điện thoại"
            description={user.phone_number || 'Chưa cập nhật'}
            left={props => <List.Icon {...props} icon="phone" color="#1976D2" />}
          />
          <Divider style={styles.itemDivider} />
          
          <List.Item
            title="Ngày tham gia"
            description={
              user.date_joined 
                ? new Date(user.date_joined).toLocaleDateString('vi-VN')
                : 'N/A'
            }
            left={props => <List.Icon {...props} icon="calendar" color="#1976D2" />}
          />
          <Divider style={styles.itemDivider} />
          
          <List.Item
            title="Lần đăng nhập cuối"
            description={
              user.last_login 
                ? new Date(user.last_login).toLocaleDateString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Chưa đăng nhập'
            }
            left={props => <List.Icon {...props} icon="login" color="#1976D2" />}
          />
        </Surface>
        
        {/* Yêu cầu vai trò chờ duyệt */}
        {pendingRoles.length > 0 && (
          <Surface style={styles.detailCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Yêu cầu vai trò chờ duyệt</Text>
              
              {pendingRoles.length > 1 && (
                <View style={styles.sectionActions}>
                  {bulkApproveMode ? (
                    <>
                      <Button 
                        mode="text" 
                        onPress={() => {
                          setBulkApproveMode(false);
                          setSelectedRoles([]);
                        }}
                        style={styles.cancelButton}
                      >
                        Hủy
                      </Button>
                      <Button 
                        mode="contained" 
                        onPress={handleBulkApprove}
                        style={styles.bulkApproveButton}
                        disabled={selectedRoles.length === 0}
                      >
                        Duyệt ({selectedRoles.length})
                      </Button>
                    </>
                  ) : (
                    <Button 
                      mode="outlined" 
                      onPress={() => setBulkApproveMode(true)}
                      icon="checkbox-multiple-marked"
                    >
                      Chọn nhiều
                    </Button>
                  )}
                </View>
              )}
            </View>
            <Divider style={styles.divider} />
            
            <View style={styles.pendingRolesContainer}>
              {bulkApproveMode ? (
                pendingRoles.map((role) => (
                  <View key={role.id} style={styles.bulkSelectItem}>
                    <Checkbox
                      status={selectedRoles.includes(role.id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleRoleSelection(role.id)}
                    />
                    <View style={styles.bulkSelectRole}>
                      <Text style={styles.bulkSelectRoleName}>{role.role}</Text>
                      <Text style={styles.bulkSelectRoleDate}>
                        Yêu cầu: {new Date(role.created_at).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                pendingRoles.map((role) => (
                  <PendingRoleItem
                    key={role.id}
                    role={role}
                    onApprove={() => handleApproveRole(role.id)}
                    onReject={() => handleRejectRole(role.id)}
                    loading={processingRole === role.id}
                  />
                ))
              )}
            </View>
          </Surface>
        )}
        
        {/* Quản lý tài khoản */}
        <Surface style={styles.detailCard}>
          <Text style={styles.cardTitle}>Quản lý tài khoản</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.accountActionItem}>
            <View style={styles.accountActionInfo}>
              <Text style={styles.accountActionTitle}>Trạng thái tài khoản</Text>
              <Text style={[
                styles.accountActionStatus,
                user.is_active ? styles.activeStatus : styles.inactiveStatus
              ]}>
                {user.is_active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
              </Text>
            </View>
            <Switch
              value={user.is_active}
              onValueChange={toggleUserStatus}
              disabled={savingStatus}
              color="#1976D2"
            />
          </View>
          <Divider style={styles.itemDivider} />
          
          {!user.roles?.includes('Admin') && (
            <TouchableOpacity 
              style={styles.assignAdminButton}
              onPress={() => {
                Alert.alert(
                  'Xác nhận',
                  `Bạn có chắc chắn muốn gán quyền Admin cho ${user.username}?`,
                  [
                    { text: 'Hủy', style: 'cancel' },
                    { 
                      text: 'Đồng ý', 
                      onPress: async () => {
                        try {
                          setLoading(true);
                          await adminAPI.assignAdmin(userToken, userId);
                          fetchUserDetails();
                          Alert.alert('Thành công', 'Đã gán quyền Admin cho người dùng');
                        } catch (error) {
                          Alert.alert('Lỗi', 'Không thể gán quyền Admin');
                        } finally {
                          setLoading(false);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="shield-crown" size={24} color="#D32F2F" />
              <Text style={styles.assignAdminText}>Gán quyền Admin</Text>
            </TouchableOpacity>
          )}
        </Surface>
      </ScrollView>
      
      {/* Dialog từ chối yêu cầu vai trò */}
      <Portal>
        <Dialog visible={showRejectDialog} onDismiss={() => setShowRejectDialog(false)}>
          <Dialog.Title>Từ chối yêu cầu vai trò</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>Vui lòng nhập lý do từ chối:</Text>
            <List.Item
              title="Không đủ thông tin xác thực"
              onPress={() => setRejectReason('Không đủ thông tin xác thực')}
              right={() => (
                <MaterialCommunityIcons 
                  name={rejectReason === 'Không đủ thông tin xác thực' ? 'radiobox-marked' : 'radiobox-blank'} 
                  size={24} 
                  color="#1976D2" 
                />
              )}
            />
            <List.Item
              title="Thông tin không chính xác"
              onPress={() => setRejectReason('Thông tin không chính xác')}
              right={() => (
                <MaterialCommunityIcons 
                  name={rejectReason === 'Thông tin không chính xác' ? 'radiobox-marked' : 'radiobox-blank'} 
                  size={24} 
                  color="#1976D2" 
                />
              )}
            />
            <List.Item
              title="Tài liệu không hợp lệ"
              onPress={() => setRejectReason('Tài liệu không hợp lệ')}
              right={() => (
                <MaterialCommunityIcons 
                  name={rejectReason === 'Tài liệu không hợp lệ' ? 'radiobox-marked' : 'radiobox-blank'} 
                  size={24} 
                  color="#1976D2" 
                />
              )}
            />
            <List.Item
              title="Không đủ điều kiện"
              onPress={() => setRejectReason('Không đủ điều kiện')}
              right={() => (
                <MaterialCommunityIcons 
                  name={rejectReason === 'Không đủ điều kiện' ? 'radiobox-marked' : 'radiobox-blank'} 
                  size={24} 
                  color="#1976D2" 
                />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRejectDialog(false)}>Hủy</Button>
            <Button 
              onPress={confirmRejectRole} 
              disabled={!rejectReason}
              mode="contained"
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  menuButton: {
    padding: 8,
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
  },
  profileCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
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
  paddingHorizontal: 8,
  borderRadius: 16,
  alignSelf: 'flex-start',
  marginTop: 8,
},
activeRoleText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '500',
  marginLeft: 4,
},
divider: {
  backgroundColor: '#E5E7EB',
},
profileDetails: {
  padding: 16,
},
sectionTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 12,
},
roleChips: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},
roleChip: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 16,
  marginRight: 8,
  marginBottom: 8,
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
detailCard: {
  marginHorizontal: 16,
  marginBottom: 16,
  borderRadius: 12,
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
sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},
sectionActions: {
  flexDirection: 'row',
  alignItems: 'center',
},
cancelButton: {
  marginRight: 8,
},
bulkApproveButton: {
  backgroundColor: '#1976D2',
},
pendingRolesContainer: {
  marginTop: 8,
},
pendingRoleCard: {
  marginBottom: 12,
  borderRadius: 8,
  overflow: 'hidden',
  elevation: 1,
},
pendingRoleHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
},
pendingRoleIcon: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#1976D2',
  justifyContent: 'center',
  alignItems: 'center',
},
pendingRoleInfo: {
  flex: 1,
  marginLeft: 12,
},
pendingRoleTitle: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
},
pendingRoleDate: {
  fontSize: 12,
  color: '#666',
  marginTop: 2,
},
pendingRoleDetails: {
  padding: 12,
  paddingTop: 0,
},
detailItem: {
  marginTop: 12,
},
detailLabel: {
  fontSize: 14,
  color: '#666',
  marginBottom: 4,
},
detailValue: {
  fontSize: 14,
  color: '#333',
},
documentLink: {
  flexDirection: 'row',
  alignItems: 'center',
},
documentLinkText: {
  marginLeft: 4,
  color: '#1976D2',
  textDecorationLine: 'underline',
},
actionButtons: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 16,
},
actionButton: {
  marginLeft: 8,
},
approveButton: {
  backgroundColor: '#1976D2',
},
rejectButton: {
  borderColor: '#F44336',
},
bulkSelectItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
bulkSelectRole: {
  marginLeft: 8,
},
bulkSelectRoleName: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
},
bulkSelectRoleDate: {
  fontSize: 12,
  color: '#666',
},
accountActionItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
},
accountActionInfo: {
  flex: 1,
},
accountActionTitle: {
  fontSize: 16,
  color: '#333',
},
accountActionStatus: {
  fontSize: 14,
  marginTop: 2,
},
activeStatus: {
  color: '#4CAF50',
},
inactiveStatus: {
  color: '#F44336',
},
assignAdminButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
},
assignAdminText: {
  marginLeft: 12,
  fontSize: 16,
  color: '#D32F2F',
  fontWeight: '500',
},
dialogText: {
  marginBottom: 16,
},
});

export default UserDetail;