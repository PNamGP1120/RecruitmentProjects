import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Linking,
    TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HelpSupportScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            question: 'Làm thế nào để đăng tin tuyển dụng?',
            answer: 'Để đăng tin tuyển dụng, bạn cần đăng nhập vào tài khoản nhà tuyển dụng, sau đó nhấn vào nút "Đăng tin" ở màn hình chính. Điền đầy đủ thông tin về vị trí tuyển dụng và nhấn "Đăng tin".'
        },
        {
            question: 'Làm sao để chỉnh sửa thông tin công ty?',
            answer: 'Vào mục "Hồ sơ" từ menu chính, sau đó chọn "Chỉnh sửa thông tin". Cập nhật các thông tin cần thiết và nhấn "Lưu".'
        },
        {
            question: 'Làm thế nào để xem ứng viên đã ứng tuyển?',
            answer: 'Vào chi tiết tin tuyển dụng, phần "Danh sách ứng viên" sẽ hiển thị tất cả các ứng viên đã ứng tuyển vào vị trí này.'
        },
        {
            question: 'Thời gian duyệt tin tuyển dụng là bao lâu?',
            answer: 'Thông thường tin tuyển dụng sẽ được duyệt trong vòng 24 giờ làm việc sau khi đăng.'
        },
    ];

    const supportChannels = [
        {
            icon: 'mail-outline',
            title: 'Email hỗ trợ',
            description: 'support@jobrecruitment.com',
            action: () => Linking.openURL('mailto:support@jobrecruitment.com')
        },
        {
            icon: 'call-outline',
            title: 'Hotline',
            description: '0123 456 789',
            action: () => Linking.openURL('tel:+84123456789')
        },
        {
            icon: 'chatbubbles-outline',
            title: 'Live Chat',
            description: 'Chat trực tiếp với nhân viên hỗ trợ',
            action: () => navigation.navigate('LiveChat')
        },
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <Text style={styles.headerTitle}>Trợ giúp & Hỗ trợ</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Support Channels */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kênh hỗ trợ</Text>
                    <View style={styles.supportChannels}>
                        {supportChannels.map((channel, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.channelItem}
                                onPress={channel.action}
                            >
                                <View style={styles.channelIcon}>
                                    <Ionicons name={channel.icon} size={24} color="#004aad" />
                                </View>
                                <Text style={styles.channelTitle}>{channel.title}</Text>
                                <Text style={styles.channelDescription}>{channel.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* FAQs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
                    {filteredFaqs.map((faq, index) => (
                        <View key={index} style={styles.faqItem}>
                            <Text style={styles.question}>{faq.question}</Text>
                            <Text style={styles.answer}>{faq.answer}</Text>
                        </View>
                    ))}
                </View>

                {/* Contact Form */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gửi yêu cầu hỗ trợ</Text>
                    <TouchableOpacity 
                        style={styles.supportButton}
                        onPress={() => navigation.navigate('SupportRequest')}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={styles.supportButtonText}>Tạo yêu cầu hỗ trợ mới</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
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
    supportChannels: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    channelItem: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    channelIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e6f0ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    channelTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    channelDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    faqItem: {
        marginBottom: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#004aad',
        borderRadius: 8,
        padding: 16,
        gap: 8,
    },
    supportButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default HelpSupportScreen;