import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Linking,
    SafeAreaView,
    StatusBar,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AboutScreen = ({ navigation }) => {
    const openLink = (url) => {
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Về chúng tôi</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <Image 
                        source={require('../../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Job Recruitment</Text>
                    <Text style={styles.version}>Phiên bản 1.0.0</Text>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Giới thiệu</Text>
                    <Text style={styles.description}>
                        Job Recruitment là nền tảng kết nối nhà tuyển dụng và người tìm việc hàng đầu.
                        Chúng tôi cung cấp giải pháp tuyển dụng hiệu quả và tiện lợi cho doanh nghiệp,
                        đồng thời tạo cơ hội việc làm tốt nhất cho người tìm việc.
                    </Text>
                </View>

                {/* Features Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tính năng chính</Text>
                    <View style={styles.featureList}>
                        <FeatureItem 
                            icon="search-outline"
                            title="Tìm kiếm thông minh"
                            description="Tìm kiếm việc làm phù hợp dựa trên kỹ năng và kinh nghiệm"
                        />
                        <FeatureItem 
                            icon="briefcase-outline"
                            title="Đăng tin tuyển dụng"
                            description="Đăng tin tuyển dụng dễ dàng và tiếp cận ứng viên tiềm năng"
                        />
                        <FeatureItem 
                            icon="people-outline"
                            title="Kết nối trực tiếp"
                            description="Kết nối trực tiếp giữa nhà tuyển dụng và ứng viên"
                        />
                    </View>
                </View>

                {/* Contact Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Liên hệ</Text>
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={() => openLink('mailto:support@jobrecruitment.com')}
                    >
                        <Ionicons name="mail-outline" size={24} color="#004aad" />
                        <Text style={styles.contactText}>support@jobrecruitment.com</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={() => openLink('tel:+84123456789')}
                    >
                        <Ionicons name="call-outline" size={24} color="#004aad" />
                        <Text style={styles.contactText}>0123 456 789</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.contactItem}
                        onPress={() => openLink('https://jobrecruitment.com')}
                    >
                        <Ionicons name="globe-outline" size={24} color="#004aad" />
                        <Text style={styles.contactText}>www.jobrecruitment.com</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Feature Item Component
const FeatureItem = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
        <View style={styles.featureIcon}>
            <Ionicons name={icon} size={24} color="#004aad" />
        </View>
        <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight + 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    logoSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#004aad',
        marginBottom: 8,
    },
    version: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
    },
    featureList: {
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e6f0ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    contactText: {
        fontSize: 15,
        color: '#004aad',
    },
});

export default AboutScreen;