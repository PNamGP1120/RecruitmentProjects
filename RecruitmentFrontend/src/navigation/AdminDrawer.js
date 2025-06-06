// src/navigation/AdminDrawer.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';

// Import CustomDrawerContent
import CustomDrawerContent from '../components/Admin/CustomDrawerContent';

// Import các screens
import AdminTabNavigator from './AdminTabNavigator';
import PendingRoles from '../screens/Admin/UserManagement/PendingRoles';
import PendingJobs from '../screens/Admin/JobManagement/PendingJobs';
import UserStats from '../screens/Admin/Reports/UserStats';
import ActivityLogs from '../screens/Admin/Reports/ActivityLogs';
import UserList from '../screens/Admin/UserManagement/UserList';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

const AdminDrawer = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#1976D2',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                drawerActiveTintColor: '#1976D2',
                drawerStyle: {
                    backgroundColor: '#fff',
                    width: 280,
                },
                headerShown: false,
            }}
        >
            <Drawer.Screen
                name="AdminHome"
                component={AdminTabNavigator}
                options={{
                    title: 'Trang chủ',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="PendingRoles"
                component={PendingRoles}
                options={{
                    title: 'Phê duyệt vai trò',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="verified-user" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="PendingJobs"
                component={PendingJobs}
                options={{
                    title: 'Việc làm chờ duyệt',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="work" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="UserStats"
                component={UserStats}
                options={{
                    title: 'Thống kê người dùng',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="analytics" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="ActivityLogs"
                component={ActivityLogs}
                options={{
                    title: 'Lịch sử hoạt động',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="history" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="UserManagement"
                component={UserList}
                options={{
                    title: 'Quản lý người dùng',
                    drawerIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-group" size={size} color={color} />
                    ),
                }}
            />

        </Drawer.Navigator>
    );
};

export default AdminDrawer;