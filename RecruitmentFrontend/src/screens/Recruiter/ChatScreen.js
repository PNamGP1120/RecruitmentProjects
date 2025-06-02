// src/screens/Recruiter/ChatScreen.js

import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { sendMessage, listenForMessages } from "../../api/firebaseService"; // Sử dụng Firebase service
import { AuthContext } from "../../contexts/AuthContext"; // Để lấy thông tin người dùng

const ChatScreen = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const { user } = useContext(AuthContext); // Lấy thông tin người dùng

  useEffect(() => {
    // Lắng nghe tin nhắn mới trong cuộc hội thoại
    listenForMessages(conversationId, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      // Cleanup khi component unmount
    };
  }, [conversationId]);

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      sendMessage(conversationId, user.id, messageContent); // Gửi tin nhắn
      setMessageContent(""); // Reset input field
    }
  };

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View>
            <Text>{item.senderId}: {item.content}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <TextInput
        value={messageContent}
        onChangeText={setMessageContent}
        placeholder="Type a message"
      />

      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

export default ChatScreen;
