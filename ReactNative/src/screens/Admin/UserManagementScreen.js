import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserManagementScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quản lý người dùng</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 22, fontWeight: 'bold' },
});