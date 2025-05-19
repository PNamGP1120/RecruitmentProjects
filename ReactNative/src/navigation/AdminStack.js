import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboard from '../screens/Admin/AdminDashboard';
import PendingRecruitersScreen from '../screens/Admin/PendingRecruitersScreen';
import AssignAdminScreen from '../screens/Admin/AssignAdminScreen';
import ApproveRecruiterScreen from '../screens/Admin/ApproveRecruiterScreen';
import AdminTabNavigator from './AdminTabNavigator';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator id="admin-stack">
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />

      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="PendingRecruiters" component={PendingRecruitersScreen} options={{ title: 'Nhà tuyển dụng chờ duyệt' }} />
      <Stack.Screen name="AssignAdmin" component={AssignAdminScreen} options={{ title: 'Gán quyền Admin' }} />
      <Stack.Screen name="ApproveRecruiter" component={ApproveRecruiterScreen} options={{ title: 'Phê duyệt Nhà tuyển dụng' }} />
    </Stack.Navigator>
  );
}