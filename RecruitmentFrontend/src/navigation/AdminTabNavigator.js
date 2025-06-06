// src/navigation/AdminTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import Dashboard from '../screens/Admin/Dashboard';
import UserList from '../screens/Admin/UserManagement/UserList';
import JobList from '../screens/Admin/JobManagement/JobList';
import SkillList from '../screens/Admin/SkillManagement/SkillList';
import Overview from '../screens/Admin/Reports/Overview';

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
          title: 'Tổng quan',
        }}
      />
      <Tab.Screen
        name="Users"
        component={UserList}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
          title: 'Người dùng',
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobList}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="work" size={size} color={color} />
          ),
          title: 'Việc làm',
        }}
      />
      <Tab.Screen
        name="Skills"
        component={SkillList}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="psychology" size={size} color={color} />
          ),
          title: 'Kỹ năng',
        }}
      />
      <Tab.Screen
        name="Reports"
        component={Overview}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" size={size} color={color} />
          ),
          title: 'Báo cáo',
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;