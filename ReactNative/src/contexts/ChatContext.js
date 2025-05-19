import React, { createContext, useState, useEffect } from 'react';
import { listenMessages, sendMessage } from '../api/firebaseService';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);

  // Hàm load messages realtime khi chọn conversation
  const subscribeMessages = (conversationId) => {
    listenMessages(conversationId, setCurrentMessages);
  };

  // Hàm gửi message
  const sendNewMessage = (conversationId, message) => {
    sendMessage(conversationId, message);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      setConversations,
      currentMessages,
      subscribeMessages,
      sendNewMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
