// src/screens/Common/InterviewScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InterviewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Màn hình Phỏng vấn trực tuyến</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
});
