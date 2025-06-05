import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ConversationsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
      </View>

      <FlatList
        data={[]} // Sẽ thêm data sau
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.conversationItem}
            onPress={() => navigation.navigate('ChatDetail')}
          >
            <View style={styles.avatar}>
              <Ionicons name="person-circle" size={50} color="#004aad" />
            </View>
            <View style={styles.conversationInfo}>
              <Text style={styles.userName}>Tên người dùng</Text>
              <Text style={styles.lastMessage}>Tin nhắn cuối cùng...</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  conversationInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  lastMessage: {
    color: '#666',
    marginTop: 4,
  },
});