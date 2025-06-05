import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function JobSeekerDrawer({ navigation }) {
  const { userInfo, signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    // Có thể gọi API /auth/logout/ ở đây nếu cần
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Avatar và tên */}
      <View style={styles.header}>
        <Image
          source={{ uri: userInfo?.avatar_url || 'https://via.placeholder.com/120' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {userInfo?.first_name || ''} {userInfo?.last_name || ''}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'JobSeekerProfileEdit' })}>
          <Text style={styles.viewProfile}>View Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu items */}
      <View style={styles.menu}>
        <DrawerItem
          icon={<Ionicons name="information-circle-outline" size={24} color="#222" />}
          label="Personal Information"
          onPress={() => navigation.navigate('Main', { screen: 'ProfileEdit' })}
        />
        <DrawerItem
          icon={<MaterialIcons name="assignment" size={24} color="#222" />}
          label="Applications"
          onPress={() => navigation.navigate('Main', { screen: 'ApplicationStatus' })}
        />
        <DrawerItem
          icon={<Ionicons name="document-text-outline" size={24} color="#222" />}
          label="Resumes"
          onPress={() => navigation.navigate('Main', { screen: 'CVList' })}
        />
        <DrawerItem
          icon={<MaterialIcons name="logout" size={24} color="#d33" />}
          label="Logout"
          labelStyle={{ color: '#d33' }}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}

function DrawerItem({ icon, label, onPress, labelStyle }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.icon}>{icon}</View>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  viewProfile: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  menu: {
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  icon: {
    marginRight: 18,
  },
  label: {
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
  },
});