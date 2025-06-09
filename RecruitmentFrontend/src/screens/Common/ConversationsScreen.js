import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const ConversationsScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);
  const { conversations, loading, setCurrentConversation, getOtherParticipant } = useChat();

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
    navigation.navigate('Chat', { conversationId: conversation.id });
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';

    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    
    // Nếu tin nhắn được gửi trong vòng 24 giờ, hiển thị giờ
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Nếu tin nhắn được gửi trong tuần này, hiển thị thứ
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    }
    
    // Nếu tin nhắn cũ hơn, hiển thị ngày tháng
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const renderConversationItem = ({ item }) => {
    const otherUser = getOtherParticipant(item);
    const isUnread = item.lastSenderId !== userInfo.id && 
                     (!item.readStatus || !item.readStatus[userInfo.id]);
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleSelectConversation(item)}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {otherUser?.avatar ? (
            <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Thông tin cuộc trò chuyện */}
        <View style={styles.conversationInfo}>
          <View style={styles.nameTimeRow}>
            <Text style={[styles.name, isUnread && styles.unreadText]}>
              {otherUser?.name || 'Người dùng'}
            </Text>
            <Text style={styles.time}>
              {formatLastMessageTime(item.lastMessageTimestamp)}
            </Text>
          </View>
          
          <View style={styles.messagePreviewRow}>
            <Text 
              style={[styles.messagePreview, isUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {item.lastSenderId === userInfo.id ? 'Bạn: ' : ''}
              {item.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
            </Text>
            
            {isUnread && <View style={styles.unreadBadge} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
      <Text style={styles.emptySubtext}>
        Bạn có thể bắt đầu trò chuyện với người dùng khác
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
      </View>
      
      {/* Danh sách cuộc trò chuyện */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004aad" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  messagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagePreview: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#004aad',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ConversationsScreen;