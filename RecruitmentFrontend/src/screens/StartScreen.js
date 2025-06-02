import React, { useContext, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function StartScreen({ navigation }) {
  const { user, isLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigation.replace('JobSeekerHome');
      } else {
        navigation.replace('Login');
      }
    }
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text>Đang tải...</Text>
    </View>
  );
}
