// src/screens/Admin/Settings.js
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { List, Switch, Divider, Card, Title } from 'react-native-paper';

const Settings = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Thông báo</Title>
          <List.Item
            title="Thông báo đẩy"
            description="Nhận thông báo về các hoạt động mới"
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Thông báo email"
            description="Nhận email thông báo"
            right={() => (
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Giao diện</Title>
          <List.Item
            title="Chế độ tối"
            description="Bật/tắt giao diện tối"
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Bảo mật</Title>
          <List.Item
            title="Đổi mật khẩu"
            description="Thay đổi mật khẩu đăng nhập"
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Navigate to change password */}}
          />
          <Divider />
          <List.Item
            title="Xác thực hai lớp"
            description="Thiết lập xác thực hai lớp"
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Navigate to 2FA settings */}}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Thông tin ứng dụng</Title>
          <List.Item
            title="Phiên bản"
            description="1.0.0"
          />
          <Divider />
          <List.Item
            title="Điều khoản sử dụng"
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Navigate to terms */}}
          />
          <Divider />
          <List.Item
            title="Chính sách bảo mật"
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {/* Navigate to privacy policy */}}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
});

export default Settings;