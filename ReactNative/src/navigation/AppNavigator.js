import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function AppNavigator() {
  const { userToken, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      {userToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

