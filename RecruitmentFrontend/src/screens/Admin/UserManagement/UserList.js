import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Avatar, Chip, Button, ActivityIndicator, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';

const UserList = ({ navigation }) => {
    const { userToken } = useAuth();  // Thay đổi từ { state } thành { userToken }
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ role: null, status: 'all' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('filter', filter);
      const response = await adminAPI.getUsers(userToken, {  // Thay đổi state.userToken thành userToken
        search: searchQuery,
        role: filter.role,
        status: filter.status !== 'all' ? filter.status : undefined
      });
      console.log('response', response);
      setUsers(response.results || response);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleUserPress = (user) => {
    navigation.navigate('UserDetail', { userId: user.id, user });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return '#F44336';
      case 'Recruiter': return '#2196F3';
      case 'JobSeeker': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Text 
            size={50} 
            label={item.username ? item.username.substring(0, 2).toUpperCase() : '??'} 
            backgroundColor="#1976D2" 
          />
          <View style={styles.userInfo}>
            <Title>{item.username || 'N/A'}</Title>
            <Paragraph>{item.email || 'Không có email'}</Paragraph>
            <View style={styles.chipContainer}>
              {item.roles && item.roles.map((role, index) => (
                <Chip 
                  key={index} 
                  style={{ backgroundColor: getRoleColor(role), marginRight: 5 }}
                  textStyle={{ color: 'white' }}
                >
                  {role}
                </Chip>
              ))}
              {item.is_active === false && (
                <Chip 
                  style={{ backgroundColor: '#FF9800' }}
                  textStyle={{ color: 'white' }}
                >
                  Đã khóa
                </Chip>
              )}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#757575" />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm người dùng..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="person-search" size={64} color="#BDBDBD" />
              <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContainer: {
    padding: 8,
  },
  card: {
    marginBottom: 8,
    marginHorizontal: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
});

export default UserList;