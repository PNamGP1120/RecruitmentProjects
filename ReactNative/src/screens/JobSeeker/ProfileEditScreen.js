import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export default function ProfileEditScreen({ navigation }) {
  const { userInfo, userToken, signOut } = useContext(AuthContext);

  const [firstName, setFirstName] = useState(userInfo?.first_name || '');
  const [lastName, setLastName] = useState(userInfo?.last_name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone_number || '');
  const [loading, setLoading] = useState(false);

  // Hàm gọi API update thông tin user
  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      // Gọi API cập nhật, ví dụ user.js có hàm updateUser
      const res = await updateUser(userToken, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
      });

      if (res.success) {
        Alert.alert('Thành công', 'Cập nhật thông tin cá nhân thành công');
        // Có thể cập nhật lại userInfo trong context nếu muốn
        navigation.goBack();
      } else {
        Alert.alert('Lỗi', res.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f7f9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Chỉnh sửa thông tin cá nhân</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nhập họ"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nhập tên"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Đang cập nhật...' : 'Cập nhật'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 30,
    color: '#004aad',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#004aad',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#7a9cd9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
