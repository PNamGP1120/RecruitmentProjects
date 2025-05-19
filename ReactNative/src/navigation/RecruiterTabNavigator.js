import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Recruiter/HomeScreen';
import CreateJobScreen from '../screens/Recruiter/CreateJobScreen';
import ConversationsScreen from '../screens/Recruiter/ConversationsScreen';
import ProfileScreen from '../screens/Recruiter/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function RecruiterTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'CreateJob':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#004aad',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        tabBarStyle: { paddingBottom: 4, height: 60 },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="CreateJob"
        component={CreateJobScreen}
        options={{ tabBarLabel: 'Tạo tin' }}
      />
      <Tab.Screen
        name="Messages"
        component={ConversationsScreen}
        options={{ tabBarLabel: 'Tin nhắn' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
}