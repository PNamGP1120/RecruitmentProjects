// src/navigation/AdminStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboard from '../screens/Admin/AdminDashboard';
import PendingRecruitersScreen from '../screens/Admin/PendingRecruitersScreen';
import AssignAdminScreen from '../screens/Admin/AssignAdminScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator id="admin-stack" initialRouteName="AdminDashboard" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="PendingRecruiters" component={PendingRecruitersScreen} options={{ title: 'Nhà tuyển dụng chờ duyệt' }} />
      <Stack.Screen name="AssignAdmin" component={AssignAdminScreen} options={{ title: 'Gán quyền Admin' }} />
    </Stack.Navigator>
  );
}
