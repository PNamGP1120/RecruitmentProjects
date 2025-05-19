// src/screens/JobSeeker/ConversationsScreen.js

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { AuthContext } from '../../contexts/AuthContext'; // Để lấy thông tin người dùng

const ConversationsScreen = ({ navigation }) => { // `navigation` is now passed correctly
  const [conversations, setConversations] = useState([]);
  const { user } = useContext(AuthContext); // Lấy thông tin người dùng

  useEffect(() => {
    const conversationsRef = ref(database, 'conversations/');
    
    // Lắng nghe thay đổi cuộc hội thoại
    onValue(conversationsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedConversations = [];

      for (let conversationId in data) {
        if (data[conversationId].participants[user.id]) { // Chỉ lấy cuộc hội thoại của người dùng
          loadedConversations.push({
            id: conversationId,
            participants: data[conversationId].participants,
            lastMessage: data[conversationId].messages 
              ? Object.values(data[conversationId].messages).pop().content
              : 'No messages yet',
          });
        }
      }

      setConversations(loadedConversations); // Cập nhật danh sách cuộc hội thoại
    });

    return () => {
      // Cleanup khi component unmount
    };
  }, [user.id]);

  // Chuyển tới màn hình chat khi người dùng chọn một cuộc hội thoại
  const handleConversationPress = (conversationId) => {
    navigation.navigate('Chat', { conversationId }); // Chuyển đến màn hình Chat với conversationId
  };

  return (
    <View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleConversationPress(item.id)}>
            <View>
              <Text>Conversation with {Object.keys(item.participants).join(', ')}</Text>
              <Text>Last Message: {item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ConversationsScreen;
