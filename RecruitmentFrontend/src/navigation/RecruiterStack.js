import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import RecruiterTabNavigator from './RecruiterTabNavigator';
import RecruiterDrawer from '../components/RecruiterDrawer';

// Import các màn hình
import CandidateListScreen from '../screens/Recruiter/CandidateListScreen';
import CandidateProfileScreen from '../screens/Recruiter/CandidateProfileScreen';
import ChatScreen from '../screens/Recruiter/ChatScreen';
import CompanyProfileScreen from '../screens/Recruiter/CompanyProfileScreen';
import ConversationsScreen from '../screens/Recruiter/ConversationsScreen';
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

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#004aad' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="RecruiterTabs" component={RecruiterTabNavigator} options={{ headerShown: false }} />
        
        {/* Quản lý việc làm */}
        <Stack.Screen name="Jobs" component={JobsScreen} options={{ title: 'Quản lý việc làm' }} />
        <Stack.Screen name="CreateJob" component={CreateJobScreen} options={{ title: 'Đăng tin tuyển dụng' }} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditJob" component={EditJobScreen} options={{ headerShown: false }} />

        {/* Quản lý ứng viên */}
        <Stack.Screen name="CandidateList" component={CandidateListScreen} options={{ title: 'Danh sách ứng viên' }} />
        <Stack.Screen name="CandidateProfile" component={CandidateProfileScreen} options={{ title: 'Hồ sơ ứng viên' }} />
        <Stack.Screen name="Recruit" component={RecruitScreen} options={{ title: 'Tuyển dụng' }} />
        <Stack.Screen name="ScheduleInterview" component={ScheduleInterviewScreen} options={{ title: 'Lịch phỏng vấn', headerShown: false }} />
        <Stack.Screen name="ApplicationDetail" component={ApplicationDetail} options={{ title: 'Chi tiết ứng viên', headerShown: false }} />

        {/* Chat */}
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ title: 'Tin nhắn' }} />

        {/* Thông tin và cài đặt */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
        <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} options={{ title: 'Thông tin công ty' }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Chỉnh sửa thông tin', headerShown: false }} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Báo cáo' }} />

        {/* Khác */}
        <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Help" component={HelpSupportScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PDFViewer" component={PDFViewer} options={{ headerShown: false }} />

    </Stack.Navigator>
);

export default function RecruiterStack() {
    return (
        <Drawer.Navigator
            initialRouteName="MainStack"
            screenOptions={{ headerShown: false, drawerStyle: { backgroundColor: '#fff', width: 280 } }}
            drawerContent={props => <RecruiterDrawer {...props} />}
        >
            <Drawer.Screen name="MainStack" component={MainStack} options={{ title: 'Trang chủ' }} />
        </Drawer.Navigator>
    );
}