import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import JobSeekerTabNavigator from './JobSeekerTabNavigator';
import JobDetailScreen from '../screens/JobSeeker/JobDetailScreen';
import ApplyScreen from '../screens/JobSeeker/ApplyScreen';
import CVListScreen from '../screens/JobSeeker/CVListScreen';
import UploadCVScreen from '../screens/JobSeeker/UploadCVScreen';
import ApplicationStatusScreen from '../screens/JobSeeker/ApplicationStatusScreen';
import JobSearchScreen from '../screens/JobSeeker/JobSearchScreen';
import ProfileEditScreen from "../screens/JobSeeker/ProfileEditScreen";
import AboutScreen from "../screens/JobSeeker/AboutScreen";
import SearchFilterJobsResultScreen from '../screens/JobSeeker/SearchFilterJobsResultScreen';
import JobSeekerDrawer from '../components/JobSeekerDrawer';
import CVPreviewScreen from '../screens/JobSeeker/CVPreviewScreen';
import CVEditScreen from '../screens/JobSeeker/CVEditScreen';
import JobSeekerProfileEditScreen from '../screens/JobSeeker/JobSeekerProfileEditScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function JobSeekerStackScreens() {
    return (
        <Stack.Navigator>
            {/* Tab Navigator chứa các tab chính */}
            <Stack.Screen
                name="JobSeekerTabs"
                component={JobSeekerTabNavigator}
                options={{headerShown: false}}
            />

            {/* Các màn hình push lên stack khi cần */}
            <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{title: 'Chi tiết việc làm'}}/>
            <Stack.Screen name="Apply" component={ApplyScreen} options={{title: 'Ứng tuyển'}}/>
            <Stack.Screen name="CVList" component={CVListScreen} options={{title: 'Danh sách CV'}}/>
            <Stack.Screen name="UploadCV" component={UploadCVScreen} options={{title: 'Tải CV lên'}}/>
            <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen}
                          options={{title: 'Trạng thái ứng tuyển'}}/>
            <Stack.Screen name="JobSearch" component={JobSearchScreen}/>
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{title: 'Cập nhật hồ sơ'}}/>
            <Stack.Screen name="About" component={AboutScreen} options={{title: 'Về chúng tôi'}}/>
            <Stack.Screen name="SearchFilterJobsResult" component={SearchFilterJobsResultScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="CVPreview" component={CVPreviewScreen} options={{ title: 'Preview CV' }} />
            <Stack.Screen name="CVEdit" component={CVEditScreen} options={{ title: 'Edit CV' }} />
            <Stack.Screen name="JobSeekerProfileEdit" component={JobSeekerProfileEditScreen} options={{title: 'Chỉnh sửa hồ sơ chi tiết'}}/>
        </Stack.Navigator>
    );
}

export default function JobSeekerStack() {
    return (
        <Drawer.Navigator
            initialRouteName="Main"
            screenOptions={{ headerShown: false }}
            drawerContent={(props) => <JobSeekerDrawer {...props} />}
        >
            <Drawer.Screen name="Main" component={JobSeekerStackScreens} />
        </Drawer.Navigator>
    );
}
