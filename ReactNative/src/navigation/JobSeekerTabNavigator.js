import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/JobSeeker/HomeScreen';
import JobSearchScreen from '../screens/JobSeeker/JobSearchScreen';
import ChatScreen from '../screens/JobSeeker/ChatScreen';
import ProfileScreen from '../screens/JobSeeker/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConversationsScreen from "../screens/JobSeeker/ConversationsScreen"; 

const Tab = createBottomTabNavigator();

export default function JobSeekerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Jobs') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Messages') iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#004aad',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Jobs" component={JobSearchScreen} options={{ tabBarLabel: 'Tìm việc' }} />
      {/* <Tab.Screen name="Conversations" component={ConversationsScreen} /> */}
      <Tab.Screen name="Messages" component={ConversationsScreen} options={{ tabBarLabel: 'Tin nhắn' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Tài khoản' }} />

    </Tab.Navigator>
  );

}
