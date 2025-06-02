import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StartScreen from '../screens/StartScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import JobSeekerHomeScreen from '../screens/JobSeeker/HomeScreen';
import ChatScreen from '../screens/Chat/ChatScreen';

import { AuthContext } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // Có thể hiển thị loading indicator khi kiểm tra trạng thái đăng nhập
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false }} />
        
        {/* Nếu chưa đăng nhập thì có thể vào màn hình Login */}
        {!user && (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
          </>
        )}

        {/* Nếu đã đăng nhập thì vào màn hình chính người tìm việc */}
        {user && (
          <>
            <Stack.Screen name="JobSeekerHome" component={JobSeekerHomeScreen} options={{ title: 'Trang chủ' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Tin nhắn' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
