import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecruiterTabNavigator from './RecruiterTabNavigator';

import CompanyProfileScreen from '../screens/Recruiter/CompanyProfileScreen';
import CreateJobScreen from '../screens/Recruiter/CreateJobScreen';
import JobPostListScreen from '../screens/Recruiter/JobPostListScreen';
import CandidateListScreen from '../screens/Recruiter/CandidateListScreen';
import CandidateProfileScreen from '../screens/Recruiter/CandidateProfileScreen';
import ScheduleInterviewScreen from '../screens/Recruiter/ScheduleInterviewScreen';

const Stack = createNativeStackNavigator();

export default function RecruiterStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RecruiterTabs"
        component={RecruiterTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} options={{ title: 'Thông tin công ty' }} />
      <Stack.Screen name="CreateJob" component={CreateJobScreen} options={{ title: 'Tạo tin tuyển dụng' }} />
      <Stack.Screen name="JobPostList" component={JobPostListScreen} options={{ title: 'Danh sách tin tuyển dụng' }} />
      <Stack.Screen name="CandidateList" component={CandidateListScreen} options={{ title: 'Danh sách ứng viên' }} />
      <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} options={{ title: 'Hồ sơ ứng viên' }} />
      <Stack.Screen name="ScheduleInterview" component={ScheduleInterviewScreen} options={{ title: 'Lên lịch phỏng vấn' }} />
    </Stack.Navigator>

  );
}
