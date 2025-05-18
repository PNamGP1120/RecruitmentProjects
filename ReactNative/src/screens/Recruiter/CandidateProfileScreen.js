// src/screens/Recruiter/CandidateProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CandidateProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hồ sơ ứng viên</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' },
  text: { fontSize:24, fontWeight:'bold' },
});
