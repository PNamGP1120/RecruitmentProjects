// AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StartScreen from '../screens/StartScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import JobSeekerHomeScreen from '../screens/JobSeeker/HomeScreen';

import { AuthContext } from '../contexts/AuthContext';
import JobSeekerStack from './JobSeekerStack';
import RecruiterStack from './RecruiterStack';
import AdminStack from './AdminStack';
import AuthStack from './AuthStack';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, userInfo, loading } = useContext(AuthContext);

  if (loading) return null;
  
  // Kiểm tra role dựa trên mảng roles
  const hasRole = (roleName) => {
    return userInfo?.active_role === roleName;
  };

  return (
    <NavigationContainer>
      {console.log(userInfo)}
      {!userToken ? (
        <AuthStack />
      ) : hasRole('JobSeeker') ? (
        <JobSeekerStack />
      ) : hasRole('Recruiter') ? (
        <RecruiterStack />
      ) : hasRole('Admin') ? (
        <AdminStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
