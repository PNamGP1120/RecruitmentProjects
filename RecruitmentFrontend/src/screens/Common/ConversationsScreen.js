// src/screens/Common/ConversationsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { getUserConversations } from '../../api/firebaseService';

const ConversationsScreen = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    if (!userInfo) return;
    
    const userId = userInfo.id;
    
    // Lấy danh sách cuộc trò chuyện từ Firebase
    const userConversationsRef = ref(database, `userConversations/${userId}`);
    
    const unsubscribe = onValue(userConversationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const conversationList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => b.updatedAt - a.updatedAt); // Sắp xếp theo thời gian gần nhất
        
        setConversations(conversationList);
      } else {
        setConversations([]);
      }
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = loadConversations();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userInfo]);

  const handleOpenChat = (conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      otherUser: conversation.otherUser
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    
    // Nếu cùng ngày, chỉ hiển thị giờ
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Nếu cùng tuần, hiển thị thứ
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    }
    
    // Nếu khác, hiển thị ngày/tháng
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004aad" />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={50} color="#CCCCCC" />
          <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
          <Text style={styles.emptySubText}>Bạn có thể nhắn tin với nhà tuyển dụng hoặc ứng viên từ các trang chi tiết</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#004aad']} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.conversationItem}
              onPress={() => handleOpenChat(item)}
              activeOpacity={0.7}
            >
              {item.otherUser.avatar ? (
                <Image 
                  source={{ uri: item.otherUser.avatar }} 
                  style={styles.avatar} 
                  defaultSource={require('../../assets/icon.png')}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.otherUser.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View style={styles.conversationInfo}>
                <View style={styles.nameTimeContainer}>
                  <Text style={styles.username} numberOfLines={1}>{item.otherUser.name}</Text>
                  <Text style={styles.timeText}>{formatTime(item.updatedAt)}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    marginTop: 10,
    color: '#888888',
    fontSize: 16,
    fontWeight: 'bold'
  },
  emptySubText: {
    marginTop: 5,
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 30
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1E1E1'
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#004aad',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  conversationInfo: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'center'
  },
  nameTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1
  },
  timeText: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 5
  },
  lastMessage: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2
  }
});

export default ConversationsScreen;