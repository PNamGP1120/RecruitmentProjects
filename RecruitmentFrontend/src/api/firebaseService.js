// src/api/firebaseService.js
import { ref, push, set, onChildAdded, get, child, update, query, orderByKey } from "firebase/database";
import { database } from "../firebaseConfig";

// Gửi tin nhắn vào Firebase Realtime Database
export const sendMessage = (conversationId, senderId, content) => {
  try {
    const messageRef = ref(database, `conversations/${conversationId}/messages`);
    const newMessageRef = push(messageRef);
    
    set(newMessageRef, {
      senderId: senderId,
      content: content,
      timestamp: Date.now(),
    });
    
    // Cập nhật tin nhắn cuối cùng
    updateLastMessage(conversationId, senderId, content);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

// Lắng nghe tin nhắn mới trong cuộc hội thoại
export const listenForMessages = (conversationId, onNewMessage) => {
  try {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    
    return onChildAdded(messagesRef, (snapshot) => {
      const newMessage = {
        id: snapshot.key,
        ...snapshot.val()
      };
      onNewMessage(newMessage); // Callback khi có tin nhắn mới
    });
  } catch (error) {
    console.error('Error listening for messages:', error);
    return null;
  }
};

// Tải tất cả tin nhắn từ một cuộc trò chuyện
export const loadMessages = async (conversationId) => {
  try {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const messagesQuery = query(messagesRef, orderByKey());
    const snapshot = await get(messagesQuery);
    
    if (snapshot.exists()) {
      const messagesData = [];
      snapshot.forEach((childSnapshot) => {
        messagesData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return messagesData;
    }
    return [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
};

// Tạo hoặc lấy cuộc trò chuyện giữa hai người dùng
export const createConversation = async (user1Id, user2Id, user1Info, user2Info) => {
  try {
    // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
    const conversationId1 = `${user1Id}_${user2Id}`;
    const conversationId2 = `${user2Id}_${user1Id}`;
    
    const conversationRef1 = ref(database, `conversations/${conversationId1}`);
    const conversationRef2 = ref(database, `conversations/${conversationId2}`);
    
    const snapshot1 = await get(conversationRef1);
    const snapshot2 = await get(conversationRef2);
    
    // Nếu cuộc trò chuyện đã tồn tại, trả về ID
    if (snapshot1.exists()) return conversationId1;
    if (snapshot2.exists()) return conversationId2;
    
    // Nếu không, tạo cuộc trò chuyện mới
    const conversationId = conversationId1;
    
    // Tạo cuộc trò chuyện trong database
    const conversationRef = ref(database, `conversations/${conversationId}`);
    await set(conversationRef, {
      participants: {
        [user1Id]: true,
        [user2Id]: true
      },
      createdAt: Date.now()
    });
    
    // Thêm vào danh sách cuộc trò chuyện của user1
    const user1ConversationsRef = ref(database, `userConversations/${user1Id}/${conversationId}`);
    await set(user1ConversationsRef, {
      otherUser: {
        id: user2Id,
        name: `${user2Info.first_name || ''} ${user2Info.last_name || ''}`.trim() || 'Người dùng',
        avatar: user2Info.avatar_url || null
      },
      updatedAt: Date.now()
    });
    
    // Thêm vào danh sách cuộc trò chuyện của user2
    const user2ConversationsRef = ref(database, `userConversations/${user2Id}/${conversationId}`);
    await set(user2ConversationsRef, {
      otherUser: {
        id: user1Id,
        name: `${user1Info.first_name || ''} ${user1Info.last_name || ''}`.trim() || 'Người dùng',
        avatar: user1Info.avatar_url || null
      },
      updatedAt: Date.now()
    });
    
    return conversationId;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Cập nhật tin nhắn cuối cùng
export const updateLastMessage = (conversationId, senderId, content) => {
  try {
    const conversationRef = ref(database, `conversations/${conversationId}`);
    
    // Lấy thông tin người tham gia
    get(child(conversationRef, 'participants')).then((snapshot) => {
      if (snapshot.exists()) {
        const participants = snapshot.val();
        
        // Cập nhật tin nhắn cuối cùng cho tất cả người tham gia
        Object.keys(participants).forEach((userId) => {
          const userConversationRef = ref(database, `userConversations/${userId}/${conversationId}`);
          update(userConversationRef, {
            lastMessage: content,
            updatedAt: Date.now()
          });
        });
      }
    });
  } catch (error) {
    console.error('Error updating last message:', error);
  }
};

// Lấy danh sách cuộc trò chuyện của người dùng
export const getUserConversations = async (userId) => {
  try {
    const userConversationsRef = ref(database, `userConversations/${userId}`);
    const snapshot = await get(userConversationsRef);
    
    if (snapshot.exists()) {
      const conversations = [];
      snapshot.forEach((childSnapshot) => {
        conversations.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return conversations;
    }
    return [];
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
};