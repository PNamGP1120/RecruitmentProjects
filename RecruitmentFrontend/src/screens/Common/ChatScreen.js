// src/screens/Common/ChatScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { sendMessage, listenForMessages, loadMessages } from '../../api/firebaseService';
import { ref, onChildAdded, get } from 'firebase/database';
import { database } from '../../firebaseConfig';

const ChatScreen = ({ route, navigation }) => {
  const { userInfo } = useAuth();
  const { conversationId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const [messageSending, setMessageSending] = useState(false);

  useEffect(() => {
    // Cập nhật tiêu đề
    navigation.setOptions({
      title: otherUser.name || 'Chat',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            // Hiển thị thông tin người dùng
            Alert.alert(
              otherUser.name || 'Thông tin',
              'Bạn đang trò chuyện với ' + otherUser.name
            );
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )
    });

    // Tải tin nhắn cũ
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const oldMessages = await loadMessages(conversationId);
        setMessages(oldMessages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Lắng nghe tin nhắn mới
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const newMessage = {
        id: snapshot.key,
        ...snapshot.val()
      };
      
      // Kiểm tra xem tin nhắn đã tồn tại chưa
      setMessages(prevMessages => {
        if (!prevMessages.some(msg => msg.id === newMessage.id)) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });
    });
    
    return () => unsubscribe();
  }, [conversationId, navigation, otherUser]);

  const handleSend = async () => {
    if (inputText.trim() && !messageSending) {
      setMessageSending(true);
      const messageContent = inputText.trim();
      setInputText('');
      
      try {
        await sendMessage(conversationId, userInfo.id, messageContent);
      } catch (error) {
        console.error('Không thể gửi tin nhắn:', error);
        Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại sau.');
        setInputText(messageContent); // Khôi phục nội dung tin nhắn nếu gửi thất bại
      } finally {
        setMessageSending(false);
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const renderDate = (timestamp, prevTimestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const prevDate = prevTimestamp ? new Date(prevTimestamp) : null;
    
    // Nếu không có tin nhắn trước hoặc khác ngày, hiển thị ngày
    if (!prevDate || date.toDateString() !== prevDate.toDateString()) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateText;
      if (date.toDateString() === today.toDateString()) {
        dateText = 'Hôm nay';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateText = 'Hôm qua';
      } else {
        dateText = date.toLocaleDateString('vi-VN', { 
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      return (
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{dateText}</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#004aad" />
            <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id || index.toString()}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item, index }) => {
              const prevItem = index > 0 ? messages[index - 1] : null;
              const isMyMessage = item.senderId === userInfo.id;
              
              return (
                <>
                  {renderDate(item.timestamp, prevItem?.timestamp)}
                  <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessage : styles.theirMessage
                  ]}>
                    <Text style={styles.messageText}>{item.content}</Text>
                    <Text style={styles.timestamp}>
                      {formatTime(item.timestamp)}
                    </Text>
                  </View>
                </>
              );
            }}
          />
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhắn tin..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            onPress={handleSend} 
            style={styles.sendButton}
            disabled={!inputText.trim() || messageSending}
          >
            {messageSending ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons 
                name="send" 
                size={24} 
                color={inputText.trim() ? "#007AFF" : "#CCC"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  headerButton: {
    padding: 10
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
  dateContainer: {
    alignItems: 'center',
    marginVertical: 10
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 18,
    marginVertical: 2,
    marginHorizontal: 10
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 5
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5
  },
  messageText: {
    fontSize: 16,
    color: '#000'
  },
  timestamp: {
    fontSize: 11,
    color: '#888888',
    alignSelf: 'flex-end',
    marginTop: 2
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16
  },
  sendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ChatScreen;