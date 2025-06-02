import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Về chúng tôi</Text>

      <Text style={styles.sectionTitle}>Giới thiệu</Text>
      <Text style={styles.paragraph}>
        JobOU là nền tảng kết nối người tìm việc và nhà tuyển dụng hàng đầu,
        giúp bạn tìm kiếm việc làm nhanh chóng, dễ dàng và hiệu quả.
      </Text>

      <Text style={styles.sectionTitle}>Sứ mệnh</Text>
      <Text style={styles.paragraph}>
        Chúng tôi cam kết cung cấp trải nghiệm tìm việc thông minh,
        cá nhân hóa dựa trên hồ sơ người dùng và các công cụ hỗ trợ tối ưu.
      </Text>

      <Text style={styles.sectionTitle}>Tầm nhìn</Text>
      <Text style={styles.paragraph}>
        Trở thành cầu nối việc làm hàng đầu Việt Nam, nơi mọi người có thể phát triển
        sự nghiệp và xây dựng cộng đồng nghề nghiệp vững mạnh.
      </Text>

      <Text style={styles.sectionTitle}>Các tính năng chính</Text>
      <Text style={styles.listItem}>• Tạo hồ sơ và CV trực tuyến dễ dàng</Text>
      <Text style={styles.listItem}>• Tìm kiếm và lọc công việc thông minh</Text>
      <Text style={styles.listItem}>• Ứng tuyển nhanh chóng chỉ với một cú nhấp</Text>
      <Text style={styles.listItem}>• Chat và phỏng vấn trực tuyến qua video call</Text>
      <Text style={styles.listItem}>• Thông báo và nhắc nhở lịch phỏng vấn</Text>

      <Text style={styles.sectionTitle}>Liên hệ</Text>
      <Text style={styles.paragraph}>
        Email: support@jobou.vn
      </Text>
      <Text style={styles.paragraph}>
        Điện thoại: 0123 456 789
      </Text>
      <Text style={styles.paragraph}>
        Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#004aad',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    color: '#004aad',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 12,
    color: '#333',
  },
});
