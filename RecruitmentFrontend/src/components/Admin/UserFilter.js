// src/components/Admin/UserFilter.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Button, Title, RadioButton, Text } from 'react-native-paper';

const UserFilter = ({ visible, filters, onApply, onDismiss }) => {
  const [role, setRole] = useState(filters.role || null);
  const [status, setStatus] = useState(filters.status || 'all');

  const handleApply = () => {
    onApply({ role, status });
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Title style={styles.title}>Lọc người dùng</Title>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vai trò</Text>
          <RadioButton.Group onValueChange={value => setRole(value)} value={role}>
          // src/components/Admin/UserFilter.js (tiếp theo)
            <RadioButton.Item label="Tất cả" value={null} />
            <RadioButton.Item label="Admin" value="Admin" />
            <RadioButton.Item label="Recruiter" value="Recruiter" />
            <RadioButton.Item label="JobSeeker" value="JobSeeker" />
          </RadioButton.Group>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          <RadioButton.Group onValueChange={value => setStatus(value)} value={status}>
            <RadioButton.Item label="Tất cả" value="all" />
            <RadioButton.Item label="Đang hoạt động" value="active" />
            <RadioButton.Item label="Vô hiệu hóa" value="inactive" />
          </RadioButton.Group>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={onDismiss} 
            style={styles.button}
          >
            Hủy
          </Button>
          <Button 
            mode="contained" 
            onPress={handleApply} 
            style={styles.button}
          >
            Áp dụng
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    marginLeft: 8,
  },
});

export default UserFilter;