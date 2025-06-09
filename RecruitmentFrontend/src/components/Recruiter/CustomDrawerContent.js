import React from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Drawer, Text, Avatar, Divider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';

const CustomDrawerContent = (props) => {
  const { userInfo, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          onPress: () => {
            signOut();
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header với thông tin người dùng */}
      <View style={styles.header}>
        {userInfo?.avatar_url ? (
          <Avatar.Image 
            size={64} 
            source={{ uri: userInfo.avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text 
            size={64} 
            label={(userInfo?.username ? userInfo.username.substring(0, 2) : 'R').toUpperCase()}
            style={styles.avatar}
          />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userInfo?.username || 'Nhà tuyển dụng'}</Text>
          <Text style={styles.userEmail}>{userInfo?.email || ''}</Text>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      {/* Danh sách menu từ DrawerNavigator */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      
      <Divider style={styles.divider} />
      
      {/* Phần footer với nút đăng xuất */}
      <View style={styles.footer}>
        <Drawer.Item
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          )}
          label="Cài đặt"
          onPress={() => props.navigation.navigate('EditProfile')}
        />
        <Drawer.Item
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" color="#ff4444" size={size} />
          )}
          label="Đăng xuất"
          labelStyle={{ color: '#ff4444' }}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#004aad',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'white',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  drawerContent: {
    paddingTop: 8,
  },
  footer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default CustomDrawerContent;