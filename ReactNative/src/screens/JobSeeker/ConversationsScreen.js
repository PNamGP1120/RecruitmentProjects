import React, { useEffect, useContext } from 'react';
import { FlatList, TouchableOpacity, Text, View } from 'react-native';
import { ChatContext } from '../../contexts/ChatContext';
import api from '../../api/user'; // giả sử api gọi backend

export default function ConversationsScreen({ navigation }) {
  const { conversations, setConversations } = useContext(ChatContext);

  useEffect(() => {
    // Load danh sách conversation từ backend khi mount
    api.getConversations()
      .then(response => setConversations(response.data))
      .catch(err => console.log(err));
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatScreen', { conversationId: item.id })}
      style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ccc' }}
    >
      <Text>{item.user1} & {item.user2}</Text>
      <Text>{new Date(item.created_at).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}
