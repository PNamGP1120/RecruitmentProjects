// src/api/firebaseService.js

import { ref, push, set, onChildAdded } from "firebase/database";
import { database } from "../firebaseConfig";

// Gửi tin nhắn vào Firebase Realtime Database
export const sendMessage = (conversationId, senderId, content) => {
  const messageRef = ref(database, `conversations/${conversationId}/messages`);
  const newMessageRef = push(messageRef);
  set(newMessageRef, {
    senderId: senderId,
    content: content,
    timestamp: Date.now(),
  });
};

// Lắng nghe tin nhắn mới trong cuộc hội thoại
export const listenForMessages = (conversationId, onNewMessage) => {
  const messagesRef = ref(database, `conversations/${conversationId}/messages`);
  
  onChildAdded(messagesRef, (snapshot) => {
    const newMessage = snapshot.val();
    onNewMessage(newMessage); // Callback khi có tin nhắn mới
  });
};
