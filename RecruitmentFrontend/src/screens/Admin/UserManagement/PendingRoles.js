// src/screens/Admin/UserManagement/PendingRoles.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Title, Paragraph, ActivityIndicator, Chip } from 'react-native-paper';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';

const PendingRoles = () => {
  const { userToken } = useAuth();
  const [pendingRoles, setPendingRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const fetchPendingRoles = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingRoles(userToken);
      setPendingRoles(response || []);
    } catch (error) {
      console.error('Error fetching pending roles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingRoles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingRoles();
  };

  const toggleRoleSelection = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const handleApproveSelected = async () => {
    if (selectedRoles.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một yêu cầu để duyệt');
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
              await adminAPI.approveRoles(userToken, selectedRoles);
              Alert.alert('Thành công', 'Các yêu cầu đã được duyệt');
              setSelectedRoles([]);
              fetchPendingRoles();
            } catch (error) {
              console.error('Error approving roles:', error);
              Alert.alert('Lỗi', 'Không thể duyệt yêu cầu. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  const renderRoleItem = ({ item }) => {
    const isSelected = selectedRoles.includes(item.id);
    
    return (
      <Card 
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => toggleRoleSelection(item.id)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>{item.user.username}</Title>
            <Chip mode="outlined" style={styles.roleChip}>{item.role}</Chip>
          </View>
          <Paragraph>Email: {item.user.email}</Paragraph>
          {item.user.company_name && (
            <Paragraph>Công ty: {item.user.company_name}</Paragraph>
          )}
          <Paragraph>Ngày yêu cầu: {new Date(item.created_at).toLocaleDateString()}</Paragraph>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="contained" 
            onPress={() => {
              setSelectedRoles([item.id]);
              handleApproveSelected();
            }}
            style={styles.approveButton}
          >
            Duyệt
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => Alert.alert('Chức năng từ chối', 'Chức năng này đang được phát triển')}
          >
            Từ chối
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yêu cầu vai trò chờ duyệt</Text>
        <Text style={styles.subtitle}>{pendingRoles.length} yêu cầu đang chờ</Text>
      </View>

      {selectedRoles.length > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>Đã chọn {selectedRoles.length} yêu cầu</Text>
          <Button 
            mode="contained" 
            onPress={handleApproveSelected}
            style={styles.batchApproveButton}
          >
            Duyệt đã chọn
          </Button>
        </View>
      )}

      <FlatList
        data={pendingRoles}
        renderItem={renderRoleItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có yêu cầu nào đang chờ duyệt</Text>
          </View>
        }
      />
    </View>
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleChip: {
    backgroundColor: '#e3f2fd',
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  approveButton: {
    marginRight: 8,
    backgroundColor: '#4caf50',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 4,
    margin: 16,
  },
  selectionText: {
    fontSize: 14,
    color: '#1976D2',
  },
  batchApproveButton: {
    backgroundColor: '#1976D2',
  },
});

export default PendingRoles;