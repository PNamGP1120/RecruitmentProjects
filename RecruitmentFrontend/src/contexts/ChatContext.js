import React, { createContext, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { userInfo } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Gửi tin nhắn mới
  const sendMessage = async (text) => {
    if (!currentConversation || !text.trim() || !userInfo?.id) return;

    try {
      // Tạo tin nhắn mới với ID ngẫu nhiên
      const newMessage = {
        id: Date.now().toString(),
        senderId: userInfo.id,
        text: text.trim(),
        timestamp: new Date(),
        read: false
      };

      // Cập nhật danh sách tin nhắn
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      // Cập nhật thông tin cuộc trò chuyện
      const updatedConversation = {
        ...currentConversation,
        lastMessage: text.trim(),
        lastMessageTimestamp: new Date(),
        lastSenderId: userInfo.id
      };

      // Cập nhật danh sách cuộc trò chuyện
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversation.id ? updatedConversation : conv
      );

      setCurrentConversation(updatedConversation);
      setConversations(updatedConversations);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Không thể gửi tin nhắn');
    }
  };

  // Tạo cuộc trò chuyện mới
  const createConversation = async (participantId, participantInfo) => {
    if (!userInfo?.id || !participantId) return null;
    
    try {
      // Kiểm tra xem đã có cuộc trò chuyện với người dùng này chưa
      const existingConversation = conversations.find(conv => 
        conv.participants.includes(participantId) && conv.participants.includes(userInfo.id)
      );

      if (existingConversation) {
        setCurrentConversation(existingConversation);
        return existingConversation;
      }

      // Tạo một cuộc trò chuyện mới với ID ngẫu nhiên
      const newConversation = {
        id: Date.now().toString(),
        participants: [userInfo.id, participantId],
        createdAt: new Date(),
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        lastSenderId: userInfo.id,
        participantsInfo: {
          [userInfo.id]: {
            name: userInfo.name,
            avatar: userInfo.avatar
          },
          [participantId]: {
            name: participantInfo.name,
            avatar: participantInfo.avatar
          }
        }
      };
      
      // Cập nhật danh sách cuộc trò chuyện
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Không thể tạo cuộc trò chuyện');
      return null;
    }
  };

  // Lấy thông tin người tham gia khác trong cuộc trò chuyện
  const getOtherParticipant = (conversation) => {
    if (!conversation || !userInfo) return null;
    
    const otherParticipantId = conversation.participants.find(id => id !== userInfo.id);
    if (!otherParticipantId) return null;
    
    return conversation.participantsInfo?.[otherParticipantId] || {
      name: 'Người dùng',
      avatar: null
    };
  };

  // Đánh dấu tin nhắn đã đọc
  const markMessagesAsRead = () => {
    if (!currentConversation || !userInfo?.id) return;
    
    // Cập nhật trạng thái đã đọc cho tất cả tin nhắn
    const updatedMessages = messages.map(msg => 
      msg.senderId !== userInfo.id ? { ...msg, read: true } : msg
    );
    
    setMessages(updatedMessages);
    
    // Cập nhật trạng thái đã đọc cho cuộc trò chuyện
    const updatedConversation = {
      ...currentConversation,
      readStatus: {
        ...currentConversation.readStatus,
        [userInfo.id]: true
      }
    };
    
    // Cập nhật danh sách cuộc trò chuyện
    const updatedConversations = conversations.map(conv => 
      conv.id === currentConversation.id ? updatedConversation : conv
    );
    
    setCurrentConversation(updatedConversation);
    setConversations(updatedConversations);
    
    // Cập nhật số tin nhắn chưa đọc
    updateUnreadCount();
  };

  // Cập nhật số tin nhắn chưa đọc
  const updateUnreadCount = () => {
    const unread = conversations.filter(conv => {
      return conv.lastSenderId !== userInfo.id && 
            (!conv.readStatus || !conv.readStatus[userInfo.id]);
    }).length;
    
    setUnreadCount(unread);
  };

  // Xóa cuộc trò chuyện
  const deleteConversation = (conversationId) => {
    if (!conversationId) return;
    
    // Xóa cuộc trò chuyện khỏi danh sách
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    
    // Nếu đang xem cuộc trò chuyện bị xóa, đặt lại currentConversation
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
    
    // Cập nhật số tin nhắn chưa đọc
    updateUnreadCount();
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        unreadCount,
        sendMessage,
        createConversation,
        setCurrentConversation,
        getOtherParticipant,
        markMessagesAsRead,
        deleteConversation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);