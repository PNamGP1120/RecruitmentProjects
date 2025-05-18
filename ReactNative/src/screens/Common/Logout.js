// src/screens/Common/Logout.js
import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export default function Logout({ navigation }) {
  const { signOut } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Start' }],
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#004aad" />
      <Text style={styles.text}>Đang đăng xuất...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' },
  text: { marginTop: 15, fontSize: 18, color: '#004aad' },
});
