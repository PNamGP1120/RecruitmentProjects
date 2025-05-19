import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminHomeScreen from '../screens/Admin/AdminHomeScreen';
import UserManagementScreen from '../screens/Admin/UserManagementScreen';
import JobApprovalScreen from '../screens/Admin/JobApprovalScreen';
import AdminProfileScreen from '../screens/Admin/AdminProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'AdminHome') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'UserManagement') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'JobApproval') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          else if (route.name === 'AdminProfile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#004aad',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        tabBarStyle: { paddingBottom: 4, height: 60 },
      })}
    >
      <Tab.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ tabBarLabel: 'Thống kê' }}
      />
      <Tab.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ tabBarLabel: 'Người dùng' }}
      />
      <Tab.Screen
        name="JobApproval"
        component={JobApprovalScreen}
        options={{ tabBarLabel: 'Duyệt tin' }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
}