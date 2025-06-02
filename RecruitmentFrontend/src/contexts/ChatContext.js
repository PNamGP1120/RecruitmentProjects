// src/contexts/ChatContext.js

import React, { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState(null);

  const setConversation = (conversationId) => {
    setActiveConversation(conversationId);
  };

  return (
    <ChatContext.Provider value={{ activeConversation, setConversation }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
