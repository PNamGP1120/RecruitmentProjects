import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { userInfo, signOut } = useContext(AuthContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with avatar, name, email */}
      <View style={styles.header}>
        <Image
          source={{ uri: userInfo?.avatar_url || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {userInfo?.first_name || userInfo?.username || 'Người dùng'}
        </Text>
        <Text style={styles.email}>{userInfo?.email || 'email@example.com'}</Text>
      </View>

      {/* Cards container */}
      <View style={styles.cardsContainer}>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('CVList')}
        >
          <Ionicons name="document-text-outline" size={28} color="#004aad" />
          <Text style={styles.cardText}>Quản lý CV</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#004aad" />
          <Text style={styles.cardText}>Thông tin cá nhân</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('RecruiterRegistration')}
        >
          <Ionicons name="business-outline" size={28} color="#004aad" />
          <Text style={styles.cardText}>Công ty của tôi</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('About')}
        >
          <Ionicons name="information-circle-outline" size={28} color="#004aad" />
          <Text style={styles.cardText}>Về chúng tôi</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.logoutCard]}
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={28} color="#d33" />
          <Text style={[styles.cardText, { color: '#d33' }]}>Đăng xuất</Text>
          <Ionicons name="chevron-forward" size={20} color="#d33" />
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f9ff',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 15,
    color: '#004aad',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cardsContainer: {
    // khoảng cách giữa các thẻ
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#004aad',
    fontWeight: '600',
  },
  logoutCard: {
    backgroundColor: '#feeaea',
  },
});
