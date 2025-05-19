import React, { useContext, useEffect, useState } from 'react';
import { View, FlatList, TextInput, Button, Text } from 'react-native';
import { ChatContext } from '../../contexts/ChatContext';

export default function ChatScreen({ route }) {
  const { conversationId } = route.params;
  const { currentMessages, subscribeMessages, sendNewMessage } = useContext(ChatContext);

  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (conversationId) {
      subscribeMessages(conversationId);
    }
  }, [conversationId]);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const message = {
      sender_id: 'currentUserId', // Lấy userId từ AuthContext hoặc props
      content: inputText.trim(),
      timestamp: Date.now(),
      is_read: false,
    };

    sendNewMessage(conversationId, message);
    setInputText('');
  };

  const renderItem = ({ item }) => (
    <View style={{ padding: 8, marginVertical: 4, backgroundColor: '#eee', borderRadius: 8 }}>
      <Text>{item.sender_id}: {item.content}</Text>
      <Text style={{ fontSize: 10, color: '#666' }}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={currentMessages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        inverted // để tin nhắn mới ở dưới
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập tin nhắn..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        />
        <Button title="Gửi" onPress={handleSend} />
      </View>
    </View>
  );
}
