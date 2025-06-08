// src/navigation/AdminDrawer.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import CustomDrawerContent
import CustomDrawerContent from '../components/Admin/CustomDrawerContent';

// Import các screens
import AdminTabNavigator from './AdminTabNavigator';
import PendingRoles from '../screens/Admin/UserManagement/PendingRoles';
import PendingJobs from '../screens/Admin/JobManagement/PendingJobs';
import UserList from '../screens/Admin/UserManagement/UserList';
import JobList from '../screens/Admin/JobManagement/JobList';

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
            {/* Dashboard */}
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
            
            {/* User Management */}
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
                name="JobManagement"
                component={JobList}
                options={{
                    title: 'Quản lý việc làm',
                    drawerIcon: ({ color, size }) => (
                        <MaterialIcons name="work" size={size} color={color} />
                    ),
                }}
            />
            
            
        </Drawer.Navigator>
    );
};

export default AdminDrawer;