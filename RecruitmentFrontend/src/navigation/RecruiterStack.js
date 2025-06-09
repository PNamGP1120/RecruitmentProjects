import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import RecruiterTabNavigator from './RecruiterTabNavigator';
import RecruiterDrawer from './RecruiterDrawer';

// Import các màn hình
import CandidateListScreen from '../screens/Recruiter/CandidateListScreen';
import CandidateProfileScreen from '../screens/Recruiter/CandidateProfileScreen';
import ChatScreen from '../screens/Common/ChatScreen';
import CompanyProfileScreen from '../screens/Recruiter/CompanyProfileScreen';
import ConversationsScreen from '../screens/Common/ConversationsScreen';
import CreateJobScreen from '../screens/Recruiter/CreateJobScreen';
import HomeScreen from '../screens/Recruiter/HomeScreen';
import JobsScreen from '../screens/Recruiter/JobsScreen';
import ProfileScreen from '../screens/Recruiter/ProfileScreen';
import RecruitScreen from '../screens/Recruiter/RecruitScreen';
import ReportScreen from '../screens/Recruiter/ReportScreen';
import ScheduleInterviewScreen from '../screens/Recruiter/ScheduleInterviewScreen';
import JobDetailScreen from '../screens/Recruiter/JobDetailScreen';
import EditJobScreen from '../screens/Recruiter/EditJobScreen';
import AboutScreen from '../screens/Recruiter/AboutScreen';
import HelpSupportScreen from '../screens/Recruiter/HelpSupportScreen';
import EditProfileScreen from '../screens/Recruiter/EditProfileScreen';
import ApplicationDetail from '../screens/Recruiter/ApplicationDetail';
import PDFViewer from '../screens/Common/PDFViewer';
import VideoConferenceScreen from '../screens/Common/VideoConferenceScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => (
    <Stack.Navigator 
        screenOptions={{ 
            headerStyle: { backgroundColor: '#004aad' }, 
            headerTintColor: '#fff',
            headerShown: false // Tắt header cho tất cả các màn hình trong MainStack
        }}
    >
        <Stack.Screen name="RecruiterTabs" component={RecruiterTabNavigator} />
        
        {/* Quản lý việc làm */}
        <Stack.Screen name="Jobs" component={JobsScreen} />
        <Stack.Screen name="CreateJob" component={CreateJobScreen} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="EditJob" component={EditJobScreen} />

        {/* Quản lý ứng viên */}
        <Stack.Screen name="CandidateList" component={CandidateListScreen} />
        <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
        <Stack.Screen name="Recruit" component={RecruitScreen} />
        <Stack.Screen name="ScheduleInterview" component={ScheduleInterviewScreen} />
        <Stack.Screen name="ApplicationDetail" component={ApplicationDetail} />

        {/* Chat */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Conversations" component={ConversationsScreen} />

        {/* Thông tin và cài đặt */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />

        {/* Khác */}
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Help" component={HelpSupportScreen} />
        <Stack.Screen name="PDFViewer" component={PDFViewer} />
        <Stack.Screen name="VideoConference" component={VideoConferenceScreen} />
    </Stack.Navigator>
);

export default function RecruiterStack() {
    return (
        <Drawer.Navigator
            initialRouteName="MainStack"
            screenOptions={{ 
                headerShown: false, // This will hide the header for all drawer screens
                drawerStyle: { backgroundColor: '#fff', width: 280 } 
            }}
            drawerContent={props => <RecruiterDrawer {...props} />}
        >
            <Drawer.Screen 
                name="MainStack" 
                component={MainStack} 
                options={{ headerShown: false }} // Explicitly hide header for MainStack
            />
        </Drawer.Navigator>
    );
}