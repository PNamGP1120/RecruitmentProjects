// src/components/Admin/UserListItem.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const UserListItem = ({ user, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Avatar.Image 
        size={50} 
        source={user.avatar_url ? { uri: user.avatar_url } : require('../../../assets/icon.png')} 
      />
      
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleContainer}>
          {user.roles?.map((role, index) => (
            <Chip 
              key={index} 
              style={getRoleChipStyle(role)}
              textStyle={styles.chipText}
              compact
            >
              {role}
            </Chip>
          ))}
        </View>
      </View>
      
      <MaterialCommunityIcons name="chevron-right" size={24} color="#777" />
    </TouchableOpacity>
  );
};

const getRoleChipStyle = (role) => {
  switch (role) {
    case 'Admin':
      return [styles.roleChip, { backgroundColor: '#ffcdd2' }];
    case 'Recruiter':
      return [styles.roleChip, { backgroundColor: '#c8e6c9' }];
    case 'JobSeeker':
      return [styles.roleChip, { backgroundColor: '#bbdefb' }];
    default:
      return styles.roleChip;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  roleChip: {
    marginRight: 4,
    marginTop: 4,
    height: 24,
  },
  chipText: {
    fontSize: 12,
  },
});

export default UserListItem;