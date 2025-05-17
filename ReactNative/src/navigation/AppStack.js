import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Main/HomeScreen';
// import thêm các màn khác nếu có

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      id="AppStack"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Thêm các màn hình chính tại đây, ví dụ: */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
      {/* <Stack.Screen name="JobList" component={JobListScreen} /> */}
    </Stack.Navigator>
  );
}
