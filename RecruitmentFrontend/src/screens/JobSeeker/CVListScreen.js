// src/screens/JobSeeker/CVListScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CVListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Danh sách CV</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
});
