// src/navigation/AdminStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import AdminDrawer from './AdminDrawer';

// Import các screens
import UserDetail from '../screens/Admin/UserManagement/UserDetail';
import JobDetail from '../screens/Admin/JobManagement/JobDetail';

import PendingJobs from '../screens/Admin/JobManagement/PendingJobs';
import PendingRoles from '../screens/Admin/UserManagement/PendingRoles';
import Settings from '../screens/Admin/Settings';
import UserList from '../screens/Admin/UserManagement/UserList';
import AssignAdmin from '../screens/Admin/UserManagement/AssignAdmin';

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  const screenOptions = {
    headerStyle: {
      backgroundColor: '#1976D2',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    // Animation cho iOS
    animation: 'slide_from_right',
    // Thêm back button với icon tùy chỉnh
    headerBackTitleVisible: false,
    headerBackImage: () => (
      <MaterialIcons name="arrow-back" size={24} color="#fff" style={{ marginLeft: 8 }} />
    ),
    headerShown: false,
  };

  return (
    <Stack.Navigator
      initialRouteName="AdminDrawer"
      screenOptions={screenOptions}

    >
      {/* Main Drawer */}
      <Stack.Screen
        name="AdminDrawer"
        component={AdminDrawer}
        options={{
          headerShown: false,
        }}
      />

      {/* User Management */}
      <Stack.Screen
        name="UserDetail"
        component={UserDetail}
        options={({ route }) => ({
          title: route.params?.userId ? 'Chi tiết người dùng' : 'Thêm người dùng',
          headerRight: () => (
            route.params?.userId ? (
              <MaterialIcons
                name="delete"
                size={24}
                color="#fff"
                style={{ marginRight: 16 }}
                onPress={() => {
                  // Xử lý xóa user
                }}
              />
            ) : null
          ),
        })}
      />

      <Stack.Screen
        name="PendingRoles"
        component={PendingRoles}
        options={{
          title: 'Phê duyệt vai trò',
          headerRight: () => (
            <MaterialIcons
              name="refresh"
              size={24}
              color="#fff"
              style={{ marginRight: 16 }}
              onPress={() => {
                // Refresh data
              }}
            />
          ),
        }}
      />

      {/* Job Management */}
      <Stack.Screen
        name="JobDetail"
        component={JobDetail}
        options={({ route }) => ({
          title: 'Chi tiết công việc',
          headerRight: () => (
            <MaterialIcons
              name="more-vert"
              size={24}
              color="#fff"
              style={{ marginRight: 16 }}
              onPress={() => {
                // Show options menu
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name="PendingJobs"
        component={PendingJobs}
        options={{
          title: 'Việc làm chờ duyệt',
          headerRight: () => (
            <MaterialIcons
              name="filter-list"
              size={24}
              color="#fff"
              style={{ marginRight: 16 }}
              onPress={() => {
                // Show filter options
              }}
            />
          ),
        }}
      />


     

      <Stack.Screen
        name="UserList"
        component={UserList}
        options={{
          title: 'Quản lý người dùng',
        }}
      />

      <Stack.Screen
        name="AssignAdmin"
        component={AssignAdmin}
        options={{
          title: 'Gán quyền Admin',
        }}
      />

      {/* Settings */}
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: 'Cài đặt',
        }}
      />
    </Stack.Navigator>
  );
};

// Các helper functions cho navigation
export const adminNavigationRef = React.createRef();

export const navigateToAdminScreen = (name, params) => {
  if (adminNavigationRef.current) {
    adminNavigationRef.current.navigate(name, params);
  }
};

export const goBack = () => {
  if (adminNavigationRef.current) {
    adminNavigationRef.current.goBack();
  }
};

// Custom hook để sử dụng trong các components
export const useAdminNavigation = () => {
  return {
    navigateToAdminScreen,
    goBack,
  };
};

const styles = {
  headerButton: {
    marginRight: 16,
  },
};

export default AdminStack;