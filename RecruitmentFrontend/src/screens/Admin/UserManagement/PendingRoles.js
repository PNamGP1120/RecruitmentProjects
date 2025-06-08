// src/screens/Admin/UserManagement/PendingRoles.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  Alert, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  ActivityIndicator, 
  Divider,
  Surface,
  Avatar,
  IconButton,
  Badge,
  Checkbox,
  Appbar,
  Snackbar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';

const PendingRoles = ({ navigation }) => {
  // State variables
  const { userToken } = useAuth();
  const [pendingRoles, setPendingRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch pending roles data
  const fetchPendingRoles = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingRoles(userToken);
      
      // Ensure response is an array
      if (Array.isArray(response)) {
        console.log('Pending roles fetched:', response.length);
        setPendingRoles(response);
      } else {
        console.warn('Expected array from getPendingRoles but got:', typeof response);
        setPendingRoles([]);
      }
    } catch (error) {
      console.error('Error fetching pending roles:', error);
      showSnackbar('Không thể tải danh sách yêu cầu vai trò');
      setPendingRoles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingRoles();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingRoles();
  };

  // Toggle role selection
  const toggleRoleSelection = (roleId) => {
    if (!roleId) return;
    
    setSelectedRoles(prevSelected => {
      if (prevSelected.includes(roleId)) {
        return prevSelected.filter(id => id !== roleId);
      } else {
        return [...prevSelected, roleId];
      }
    });
  };

  // Handle approval of selected roles
  const handleApproveSelected = async () => {
    if (selectedRoles.length === 0) {
      showSnackbar('Vui lòng chọn ít nhất một yêu cầu để duyệt');
      return;
    }

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn duyệt ${selectedRoles.length} yêu cầu đã chọn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Duyệt', 
          onPress: async () => {
            try {
              setLoading(true);
              await adminAPI.approveRole(userToken, selectedRoles);
              showSnackbar('Yêu cầu đã được duyệt thành công');
              setSelectedRoles([]);
              fetchPendingRoles();
            } catch (error) {
              console.error('Error approving roles:', error);
              showSnackbar('Không thể duyệt yêu cầu. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  // Show snackbar message
  const showSnackbar = (message) => {
    setSnackbarMessage(message || 'Thông báo hệ thống');
    setSnackbarVisible(true);
  };

  // Safely get role display name
  const getRoleName = (role) => {
    if (!role) return 'Không xác định';
    
    switch (role) {
      case 'Admin':
        return 'Quản trị viên';
      case 'Recruiter':
        return 'Nhà tuyển dụng';
      case 'JobSeeker':
        return 'Ứng viên';
      default:
        return role;
    }
  };

  // Safely get role icon
  const getRoleIcon = (role) => {
    if (!role) return 'help-circle';
    
    switch (role) {
      case 'Admin':
        return 'shield-account';
      case 'Recruiter':
        return 'briefcase';
      case 'JobSeeker':
        return 'account-search';
      default:
        return 'account-question';
    }
  };

  // Safely format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Không rõ thời gian';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Thời gian không hợp lệ';
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Không rõ thời gian';
    }
  };

  // Safely get user initials for avatar
  const getUserInitials = (username) => {
    if (!username || typeof username !== 'string') return '?';
    return username.substring(0, 2).toUpperCase();
  };

  // Render a single role item
  const renderRoleItem = ({ item }) => {
    // Validate item and required fields
    if (!item || typeof item !== 'object') {
      return null;
    }
    
    // Safely access item properties
    const id = item.id;
    const user = item.user || {};
    const username = user.username || 'Người dùng không xác định';
    const email = user.email || 'Không có email';
    const role = item.role || 'Không xác định';
    const createdAt = item.created_at;
    const companyName = user.company_name;
    
    const isSelected = selectedRoles.includes(id);
    
    return (
      <Card 
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => toggleRoleSelection(id)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.userInfoContainer}>
              <Avatar.Text 
                size={40} 
                label={getUserInitials(username)}
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.email}>{email}</Text>
              </View>
            </View>
            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => toggleRoleSelection(id)}
            />
          </View>

          <Divider style={styles.divider} />
          
          <View style={styles.roleInfoContainer}>
            <View style={styles.roleChip}>
              <MaterialCommunityIcons 
                name={getRoleIcon(role)} 
                size={16} 
                color="#1976D2" 
              />
              <Text style={styles.roleText}>
                {getRoleName(role)}
              </Text>
            </View>
            
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons 
                name="calendar" 
                size={14} 
                color="#666" 
              />
              <Text style={styles.dateText}>
                {formatDate(createdAt)}
              </Text>
            </View>
          </View>
          
          {companyName ? (
            <View style={styles.companyContainer}>
              <MaterialCommunityIcons 
                name="domain" 
                size={16} 
                color="#666" 
              />
              <Text style={styles.companyText}>
                {companyName}
              </Text>
            </View>
          ) : null}
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="outlined" 
            onPress={() => {
              if (id) {
                setSelectedRoles([id]);
                handleApproveSelected();
              }
            }}
            style={styles.approveButton}
            icon="check-circle"
          >
            Duyệt
          </Button>
          <Button 
            mode="text" 
            onPress={() => Alert.alert('Thông báo', 'Chức năng từ chối đang được phát triển')}
            style={styles.rejectButton}
            icon="close-circle"
          >
            Từ chối
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Render app bar
  const renderAppBar = () => (
    <Appbar.Header style={styles.appbar}>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content 
        title="Yêu cầu vai trò" 
        subtitle={`${pendingRoles.length} yêu cầu chờ duyệt`} 
      />
    </Appbar.Header>
  );

  // Render selection bar when items are selected
  const renderSelectionBar = () => {
    if (selectedRoles.length === 0) return null;
    
    return (
      <Surface style={styles.selectionBar} elevation={4}>
        <View style={styles.selectionContent}>
          <View style={styles.selectionInfo}>
            <Badge style={styles.selectionBadge} size={24}>
              {selectedRoles.length}
            </Badge>
            <Text style={styles.selectionText}>
              Đã chọn {selectedRoles.length} yêu cầu
            </Text>
          </View>
          
          <Button 
            mode="contained" 
            onPress={handleApproveSelected}
            style={styles.batchApproveButton}
            icon="check-all"
          >
            Duyệt tất cả
          </Button>
        </View>
      </Surface>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1976D2" barStyle="light-content" />
      {renderAppBar()}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
        </View>
      ) : (
        <FlatList
          data={pendingRoles}
          renderItem={renderRoleItem}
          keyExtractor={item => item && item.id ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={[
            styles.listContainer,
            pendingRoles.length === 0 && styles.emptyListContainer
          ]}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={["#1976D2"]} 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="information-outline" 
                size={64} 
                color="#BBDEFB" 
              />
              <Text style={styles.emptyTitle}>Không có yêu cầu nào</Text>
              <Text style={styles.emptyText}>
                Hiện tại không có yêu cầu vai trò nào đang chờ duyệt.
              </Text>
              <Button 
                mode="outlined" 
                onPress={onRefresh}
                style={styles.refreshButton}
                icon="refresh"
              >
                Làm mới
              </Button>
            </View>
          }
        />
      )}
      
      {renderSelectionBar()}
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Đóng',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f9',
  },
  appbar: {
    backgroundColor: '#1976D2',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
    backgroundColor: '#1976D2',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  roleInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    color: '#1976D2',
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  companyText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  cardActions: {
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  approveButton: {
    marginRight: 8,
    borderColor: '#4CAF50',
  },
  rejectButton: {
    color: '#F44336',
  },
  selectionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionBadge: {
    backgroundColor: '#1976D2',
    marginRight: 8,
  },
  selectionText: {
    fontSize: 14,
    color: '#333',
  },
  batchApproveButton: {
    backgroundColor: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  refreshButton: {
    borderColor: '#1976D2',
  },
});

export default PendingRoles;