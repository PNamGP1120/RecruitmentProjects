import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function JobSeekerProfileEditScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Job Seeker Profile Editing (Chi tiết)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f9ff' },
  text: { fontSize: 22, fontWeight: '700', color: '#004aad' },
});