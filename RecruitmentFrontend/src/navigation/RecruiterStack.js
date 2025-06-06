import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import RecruiterTabNavigator from './RecruiterTabNavigator';
import RecruiterDrawer from '../components/RecruiterDrawer';

// Import các màn hình từ thư mục screens/Recruiter
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

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Stack Navigator chính chứa tất cả các màn hình
const MainStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: true,
            headerStyle: {
                backgroundColor: '#004aad',
            },
            headerTintColor: '#fff',
        }}
    >
        {/* Tab Navigator chính */}
        <Stack.Screen
            name="RecruiterTabs"
            component={RecruiterTabNavigator}
            options={{ headerShown: false }}
        />

        {/* Nhóm màn hình quản lý việc làm */}
        <Stack.Screen
            name="Jobs"
            component={JobsScreen}
            options={{ title: 'Quản lý việc làm' }}
        />
        <Stack.Screen
            name="CreateJob"
            component={CreateJobScreen}
            options={{ title: 'Đăng tin tuyển dụng' }}
        />

        {/* Nhóm màn hình quản lý ứng viên */}
        <Stack.Screen
            name="CandidateList"
            component={CandidateListScreen}
            options={{ title: 'Danh sách ứng viên' }}
        />
        <Stack.Screen
            name="CandidateProfile"
            component={CandidateProfileScreen}
            options={{ title: 'Hồ sơ ứng viên' }}
        />
        <Stack.Screen
            name="Recruit"
            component={RecruitScreen}
            options={{ title: 'Tuyển dụng' }}
        />
        <Stack.Screen
            name="ScheduleInterview"
            component={ScheduleInterviewScreen}
            options={{ title: 'Lịch phỏng vấn' }}
        />

        {/* Nhóm màn hình chat */}
        <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ title: 'Chat' }}
        />
        <Stack.Screen
            name="Conversations"
            component={ConversationsScreen}
            options={{ title: 'Tin nhắn' }}
        />

        {/* Nhóm màn hình thông tin và cài đặt */}
        <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Trang chủ' }}
        />
        <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Tài khoản' }}
        />
        <Stack.Screen
            name="CompanyProfile"
            component={CompanyProfileScreen}
            options={{ title: 'Thông tin công ty' }}
        />
        <Stack.Screen
            name="Report"
            component={ReportScreen}
            options={{ title: 'Báo cáo' }}
        />

        <Stack.Screen
            name="JobDetail"
            component={JobDetailScreen}
            options={{
                title: 'Chi tiết tin tuyển dụng',
                headerShown: false

            }}
        />
        <Stack.Screen
            name="EditJob"
            component={EditJobScreen}
            options={{
                headerShown: false
            }}
        />
    </Stack.Navigator>
);

// Drawer Navigator bọc ngoài Stack
export default function RecruiterStack() {
    return (
        <Drawer.Navigator
            initialRouteName="MainStack"
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#fff',
                    width: 280,
                },
            }}
            drawerContent={props => <RecruiterDrawer {...props} />}
        >
            <Drawer.Screen
                name="MainStack"
                component={MainStack}
                options={{ title: 'Trang chủ' }}
            />
        </Drawer.Navigator>
    );
}