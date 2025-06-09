// src/screens/Admin/UserManagement/AssignAdmin.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert, FlatList } from 'react-native';
import { Searchbar, Text, Card, Button, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import UserListItem from '../../../components/Admin/UserListItem';

const AssignAdmin = ({ navigation }) => {
  const { userToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setLoading(true);
      // Giả định có API searchUsers
      const response = await adminAPI.getUsers(userToken, { search: searchQuery });
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedUser) {
      Alert.alert('Thông báo', 'Vui lòng chọn một người dùng');
      return;
    }

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn gán quyền Admin cho ${selectedUser.username}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: async () => {
            try {
              console.log(selectedUser.id);
              setLoading(true);
              console.log(selectedUser.id);
              await adminAPI.assignAdmin(userToken, selectedUser.id);
              Alert.alert(
                'Thành công', 
                'Đã gán quyền Admin thành công',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error assigning admin:', error);
              Alert.alert('Lỗi', 'Không thể gán quyền Admin. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <UserListItem 
      user={item} 
      onPress={() => setSelectedUser(item)} 
      selected={selectedUser?.id === item.id}
    />
  );

  return (
    <View style={styles.container}>
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>Gán quyền Admin</Title>
          <Paragraph>
            Chức năng này cho phép gán quyền Admin cho người dùng. 
            Người dùng có quyền Admin sẽ có toàn quyền quản trị hệ thống.
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm người dùng..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
        <Button mode="contained" onPress={handleSearch} style={styles.searchButton}>
          Tìm
        </Button>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1976D2" />
      ) : (
        <>
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Hãy tìm kiếm người dùng để gán quyền Admin'}
                </Text>
              </View>
            }
          />

          {selectedUser && (
            <View style={styles.selectedUserContainer}>
              <Text style={styles.selectedUserText}>
                Đã chọn: {selectedUser.username}
              </Text>
              <Button 
                mode="contained" 
                onPress={handleAssignAdmin}
                style={styles.assignButton}
                disabled={loading}
              >
                Gán quyền Admin
              </Button>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    justifyContent: 'center',
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectedUserContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  selectedUserText: {
    fontSize: 16,
    marginBottom: 8,
  },
  assignButton: {
    backgroundColor: '#1976D2',
  },
});

export default AssignAdmin;