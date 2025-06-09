import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useChat } from '../../contexts/ChatContext';

const StartChatButton = ({ userId, userInfo, buttonStyle, textStyle }) => {
  const navigation = useNavigation();
  const { createConversation, setCurrentConversation } = useChat();

  const handleStartChat = async () => {
    try {
      if (!userId || !userInfo) {
        Alert.alert('Lỗi', 'Không thể bắt đầu cuộc trò chuyện với người dùng này');
        return;
      }

      const conversation = await createConversation(userId, userInfo);
      
      if (conversation) {
        setCurrentConversation(conversation);
        navigation.navigate('Chat', { conversationId: conversation.id });
      } else {
        Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi bắt đầu cuộc trò chuyện');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={handleStartChat}
    >
      <Ionicons name="chatbubble-outline" size={18} color="#fff" />
      <Text style={[styles.buttonText, textStyle]}>Nhắn tin</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004aad',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default StartChatButton;