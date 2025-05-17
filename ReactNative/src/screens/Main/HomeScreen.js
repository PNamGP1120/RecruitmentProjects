import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { userInfo, signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userInfo?.username || 'User'}!</Text>
      <Text>Email: {userInfo?.email}</Text>
      <Text>Active Role: {userInfo?.active_role_id || 'None'}</Text>

      <Button title="Logout" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
