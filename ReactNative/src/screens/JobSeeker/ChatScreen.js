import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

// Dữ liệu mẫu
const sampleChats = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastMessage: 'Chào bạn, bạn có thể gửi CV được không?',
    lastTime: '09:30',
  },
  {
    id: '2',
    name: 'Công ty ABC',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    lastMessage: 'Cảm ơn bạn đã ứng tuyển, chúng tôi sẽ liên hệ sớm.',
    lastTime: 'Hôm qua',
  },
  {
    id: '3',
    name: 'Lê Thị B',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: 'Bạn có thể tham gia phỏng vấn lúc 3 giờ chiều không?',
    lastTime: 'Thứ 2',
  },
];

export default function ChatScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [filteredChats, setFilteredChats] = useState(sampleChats);

  useEffect(() => {
    if (!searchText) {
      setFilteredChats(sampleChats);
    } else {
      const filtered = sampleChats.filter(chat =>
        chat.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchText]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.lastTime}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Tìm kiếm"
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9ff',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 45,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ddd',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontWeight: '700',
    fontSize: 17,
    color: '#004aad',
  },
  chatTime: {
    fontSize: 13,
    color: '#888',
  },
  lastMessage: {
    color: '#555',
    fontSize: 15,
  },
});
