import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import các màn hình
import JobsScreen from '../screens/Recruiter/JobsScreen';
import RecruitScreen from '../screens/Recruiter/RecruitScreen';
import ConversationsScreen from '../screens/Recruiter/ConversationsScreen';
import ProfileScreen from '../screens/Recruiter/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function RecruiterTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case 'Jobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Recruit':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Account':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#004aad',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Jobs" 
        component={JobsScreen} 
        options={{ 
          tabBarLabel: 'Việc làm',
          title: 'Quản lý việc làm'
        }} 
      />
      
      <Tab.Screen 
        name="Recruit" 
        component={RecruitScreen} 
        options={{ 
          tabBarLabel: 'Tuyển dụng',
          title: 'Quản lý tuyển dụng'
        }} 
      />
      
      <Tab.Screen 
        name="Chat" 
        component={ConversationsScreen} 
        options={{ 
          tabBarLabel: 'Tin nhắn',
          title: 'Tin nhắn'
        }} 
      />
      
      <Tab.Screen 
        name="Account" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'Tài khoản',
          title: 'Thông tin tài khoản'
        }} 
      />
    </Tab.Navigator>
  );
}