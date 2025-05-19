import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import JobSeekerTabNavigator from './JobSeekerTabNavigator';

import JobDetailScreen from '../screens/JobSeeker/JobDetailScreen';
import ApplyScreen from '../screens/JobSeeker/ApplyScreen';
import CVListScreen from '../screens/JobSeeker/CVListScreen';
import UploadCVScreen from '../screens/JobSeeker/UploadCVScreen';
import ApplicationStatusScreen from '../screens/JobSeeker/ApplicationStatusScreen';
import JobSearchScreen from '../screens/JobSeeker/JobSearchScreen';
import ProfileEditScreen from "../screens/JobSeeker/ProfileEditScreen";
import AboutScreen from "../screens/JobSeeker/AboutScreen";

const Stack = createNativeStackNavigator();

export default function JobSeekerStack() {
    return (
        <Stack.Navigator>
           
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

        </Stack.Navigator>
    );
}
