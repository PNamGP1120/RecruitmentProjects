import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Divider, List, Switch, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';

const UserDetail = ({ route, navigation }) => {
  const { userId, user: initialUserData } = route.params;
  const { state } = useAuth();
  const [user, setUser] = useState(initialUserData || {});
  const [loading, setLoading] = useState(!initialUserData);
  const [pendingRoles, setPendingRoles] = useState([]);
  const [savingStatus, setSavingStatus] = useState(false);
  const [approvingRole, setApprovingRole] = useState(false);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const userData = await adminAPI.getUserDetail(state.userToken, userId);
      setUser(userData);
      
      // Fetch pending roles for this user
      const pendingRolesData = await adminAPI.getPendingRoles(state.userToken, { user_id: userId });
      setPendingRoles(pendingRolesData.filter(role => !role.is_approved));
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
      await adminAPI.updateUserStatus(state.userToken, userId, { is_active: !user.is_active });
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

  const approveRole = async (roleId) => {
    try {
      setApprovingRole(true);
      await adminAPI.approveRoles(state.userToken, { role_ids: [roleId] });
      
      // Refresh data
      fetchUserDetails();
      Alert.alert('Thành công', 'Đã phê duyệt vai trò cho người dùng');
    } catch (error) {
      console.error('Error approving role:', error);
      Alert.alert('Lỗi', 'Không thể phê duyệt vai trò');
    } finally {
      setApprovingRole(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user.username ? user.username.substring(0, 2).toUpperCase() : '??'} 
            backgroundColor="#1976D2" 
          />
          <View style={styles.profileInfo}>
            <Title style={styles.username}>{user.username || 'N/A'}</Title>
            <Paragraph style={styles.email}>{user.email || 'Không có email'}</Paragraph>
            <View style={styles.roleChips}>
              {user.roles && user.roles.map((role, index) => (
                <Chip 
                  key={index} 
                  style={styles.roleChip}
                >
                  {role}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Thông tin cá nhân</Title>
          <List.Item
            title="Họ tên"
            description={user.full_name || 'Chưa cập nhật'}
            left={props => <List.Icon {...props} icon="account" />}
          />
          <Divider />
          <List.Item
            title="Số điện thoại"
            description={user.phone_number || 'Chưa cập nhật'}
            left={props => <List.Icon {...props} icon="phone" />}
          />
          <Divider />
          <List.Item
            title="Ngày tham gia"
            description={user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
        </Card.Content>
      </Card>

      {pendingRoles.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Yêu cầu vai trò chờ duyệt</Title>
            {pendingRoles.map((role) => (
              <View key={role.id} style={styles.pendingRoleItem}>
                <View style={styles.pendingRoleInfo}>
                  <Text style={styles.pendingRoleText}>
                    Yêu cầu vai trò <Text style={styles.roleName}>{role.role}</Text>
                  </Text>
                  <Text style={styles.pendingRoleDate}>
                    Ngày yêu cầu: {new Date(role.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Button 
                  mode="contained" 
                  onPress={() => approveRole(role.id)}
                  loading={approvingRole}
                  disabled={approvingRole}
                  style={styles.approveButton}
                >
                  Duyệt
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quản lý tài khoản</Title>
          <View style={styles.accountActionItem}>
            <View>
              <Text style={styles.accountActionTitle}>Trạng thái tài khoản</Text>
              <Text style={styles.accountActionDescription}>
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
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.button}
          icon="arrow-left"
        >
          Quay lại
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  roleChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  pendingRoleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pendingRoleInfo: {
    flex: 1,
  },
  pendingRoleText: {
    fontSize: 16,
  },
  roleName: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  pendingRoleDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  approveButton: {
    marginLeft: 8,
  },
  accountActionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accountActionTitle: {
    fontSize: 16,
  },
  accountActionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    paddingVertical: 8,
  },
});

export default UserDetail;