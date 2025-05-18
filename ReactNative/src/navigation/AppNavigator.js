// AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import JobSeekerStack from './JobSeekerStack';
import RecruiterStack from './RecruiterStack';
import AdminStack from './AdminStack';
import AuthStack from './AuthStack';

export default function AppNavigator() {
  const { userToken, userInfo, loading } = useContext(AuthContext);


  if (loading) return null;
  console.log(userInfo)
  return (
    <NavigationContainer>
      {!userToken ? (
        <AuthStack />
      ) : userInfo?.active_role === 'JobSeeker' ? (
        <JobSeekerStack />
      ) : userInfo?.active_role === 'Recruiter' ? (
        <RecruiterStack />
      ) : userInfo?.active_role === 'Admin' ? (
        <AdminStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
