import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../contexts/AuthContext';

export default function RecruiterDrawer(props) {
    const { signOut, userInfo } = useContext(AuthContext);

    // Danh sách menu cho nhà tuyển dụng
    const menuItems = [
        {
            icon: 'home-outline',
            label: 'Trang chủ',
            navigateTo: 'Home'
        },
        {
            icon: 'briefcase-outline',
            label: 'Quản lý việc làm',
            navigateTo: 'Jobs'
        },
        {
            icon: 'people-outline',
            label: 'Quản lý ứng viên',
            navigateTo: 'CandidateList'
        },
        {
            icon: 'chatbubbles-outline',
            label: 'Tin nhắn',
            navigateTo: 'Conversations'
        },
        {
            icon: 'calendar-outline',
            label: 'Lịch phỏng vấn',
            navigateTo: 'ScheduleInterview'
        },
        {
            icon: 'business-outline',
            label: 'Thông tin công ty',
            navigateTo: 'CompanyProfile'
        },
        {
            icon: 'bar-chart-outline',
            label: 'Báo cáo & Thống kê',
            navigateTo: 'Report'
        },
        {
            icon: 'person-outline',
            label: 'Tài khoản',
            navigateTo: 'Profile'
        }
    ];

    return (
        <DrawerContentScrollView {...props} style={styles.container}>
            {/* Phần header với thông tin user */}
            <View style={styles.userSection}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={userInfo?.avatar_url 
                            ? { uri: userInfo.avatar_url }
                            : require('../../assets/default_avatar.png')}
                        style={styles.avatar}
                    />
                </View>
                <Text style={styles.userName}>{userInfo?.username || 'Nhà tuyển dụng'}</Text>
                <Text style={styles.userEmail}>{userInfo?.email || ''}</Text>
            </View>

            {/* Danh sách menu */}
            <ScrollView style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={() => {
                            props.navigation.navigate(item.navigateTo);
                        }}
                    >
                        <Ionicons name={item.icon} size={24} color="#004aad" />
                        <Text style={styles.menuText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Nút đăng xuất */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                    signOut();
                    props.navigation.closeDrawer();
                }}
            >
                <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    userSection: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        marginBottom: 10,
        backgroundColor: '#e1e1e1',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#004aad',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    menuContainer: {
        flex: 1,
        paddingTop: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e1e1e1',
    },
    menuText: {
        marginLeft: 16,
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e1e1e1',
        marginTop: 8,
    },
    logoutText: {
        marginLeft: 16,
        fontSize: 16,
        color: '#ff4444',
    }
});