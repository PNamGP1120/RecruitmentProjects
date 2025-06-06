import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Platform,
    Linking,
    RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../contexts/AuthContext';
import { getRecruiterProfile } from '../../api/recruiter';
import { useFocusEffect } from '@react-navigation/native';

// Tách các components con ra để tối ưu re-render
const InfoItem = React.memo(({ icon, label, value, onPress, multiline }) => (
    <TouchableOpacity 
        style={styles.infoItem}
        onPress={onPress}
        disabled={!onPress}
    >
        <Ionicons name={icon} size={20} color="#666" />
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[
                styles.infoValue,
                multiline && styles.infoValueMultiline,
                !value && styles.infoValueEmpty
            ]}>
                {value || 'Chưa cập nhật'}
            </Text>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={20} color="#666" />}
    </TouchableOpacity>
));

const QuickAction = React.memo(({ icon, label, color, bgColor, onPress }) => (
    <TouchableOpacity 
        style={styles.actionItem}
        onPress={onPress}
    >
        <View style={[styles.actionIcon, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
));

const ProfileHeader = React.memo(({ onMenuPress, onLogoutPress, title }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress}>
            <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={onLogoutPress}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>
    </View>
));

const ProfileImage = React.memo(({ uri, onEditPress }) => (
    <View style={styles.avatarContainer}>
        <Image
            source={{ 
                uri: uri || 'https://via.placeholder.com/150',
                headers: { Pragma: 'no-cache' }
            }}
            style={styles.avatar}
            defaultSource={require('../../../assets/logo.png')}
        />
        <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={onEditPress}
        >
            <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
    </View>
));

const ProfileScreen = ({ navigation }) => {
    const { userToken, userInfo, signOut } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) {
            setLoading(true);
        }
        try {
            const response = await getRecruiterProfile(userToken);
            if (response) {
                setProfile(response);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert(
                'Lỗi',
                'Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userToken]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile(false);
    }, [fetchProfile]);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
            const intervalId = setInterval(() => {
                fetchProfile(false);
            }, 10000); // Refresh mỗi 10 giây

            return () => clearInterval(intervalId);
        }, [fetchProfile])
    );

    const handleLogout = useCallback(() => {
        Alert.alert(
            'Xác nhận đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', onPress: signOut, style: 'destructive' }
            ]
        );
    }, [signOut]);

    const openWebsite = useCallback((url) => {
        if (!url) return;
        
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        Linking.openURL(formattedUrl).catch(() => {
            Alert.alert('Lỗi', 'Không thể mở website');
        });
    }, []);

    const navigateToEdit = useCallback(() => {
        navigation.navigate('EditProfile', {
            profile,
            onGoBack: () => fetchProfile(false)
        });
    }, [navigation, profile, fetchProfile]);

    const navigateWithRefresh = useCallback((routeName) => {
        navigation.navigate(routeName);
        fetchProfile(false);
    }, [navigation, fetchProfile]);

    if (loading && !profile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004aad" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            <ProfileHeader 
                onMenuPress={() => navigation.openDrawer()}
                onLogoutPress={handleLogout}
                title="Hồ sơ công ty"
            />

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#004aad']}
                    />
                }
            >
                <View style={styles.profileSection}>
                    <ProfileImage 
                        uri={profile?.company_logo}
                        onEditPress={navigateToEdit}
                    />
                    <Text style={styles.companyName}>{profile?.company_name}</Text>
                    <Text style={styles.email}>{userInfo?.email}</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile?.total_jobs || 0}</Text>
                            <Text style={styles.statLabel}>Tin đăng</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile?.total_applications || 0}</Text>
                            <Text style={styles.statLabel}>Ứng viên</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Thông tin công ty</Text>
                        <TouchableOpacity 
                            style={styles.editButton}
                            onPress={navigateToEdit}
                        >
                            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                    </View>

                    <InfoItem
                        icon="globe-outline"
                        label="Website"
                        value={profile?.company_website}
                        onPress={() => openWebsite(profile?.company_website)}
                    />
                    <InfoItem
                        icon="business-outline"
                        label="Ngành nghề"
                        value={profile?.industry}
                    />
                    <InfoItem
                        icon="location-outline"
                        label="Địa chỉ"
                        value={profile?.address}
                    />
                    <InfoItem
                        icon="document-text-outline"
                        label="Giới thiệu"
                        value={profile?.company_description}
                        multiline
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quản lý tuyển dụng</Text>
                    <View style={styles.actionGrid}>
                        <QuickAction
                            icon="document-text"
                            label="Tin tuyển dụng"
                            color="#1976d2"
                            bgColor="#e3f2fd"
                            onPress={() => navigateWithRefresh('Jobs')}
                        />
                        <QuickAction
                            icon="people"
                            label="Ứng viên"
                            color="#2e7d32"
                            bgColor="#e8f5e9"
                            onPress={() => navigateWithRefresh('Applications')}
                        />
                        <QuickAction
                            icon="stats-chart"
                            label="Thống kê"
                            color="#f57c00"
                            bgColor="#fff3e0"
                            onPress={() => navigateWithRefresh('Statistics')}
                        />
                        <QuickAction
                            icon="settings"
                            label="Cài đặt"
                            color="#616161"
                            bgColor="#f5f5f5"
                            onPress={() => navigation.navigate('Settings')}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight + 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
    },
    editProfileButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#004aad',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#004aad',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#eee',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 16,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    editButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#e3f2fd',
    },
    editButtonText: {
        color: '#004aad',
        fontSize: 14,
        fontWeight: '500',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
    },
    infoValueMultiline: {
        lineHeight: 22,
    },
    infoValueEmpty: {
        color: '#999',
        fontStyle: 'italic',
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    actionItem: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 16,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
});

export default ProfileScreen;