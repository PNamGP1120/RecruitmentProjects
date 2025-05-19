import React, { useContext, useState } from 'react';
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
  ActivityIndicator,
  Image,
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { updateUser } from '../../api/user'; // hàm api updateUser đã chuẩn bị

export default function ProfileEditScreen({ navigation }) {
  const { userInfo, userToken, updateUserInfoInContext } = useContext(AuthContext);

  const [avatar, setAvatar] = useState(userInfo?.avatar_url || null);
  const [firstName, setFirstName] = useState(userInfo?.first_name || '');
  const [lastName, setLastName] = useState(userInfo?.last_name || '');
  const [username, setUsername] = useState(userInfo?.username || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [loading, setLoading] = useState(false);

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // SỬA DÒNG NÀY
        quality: 0.7,
        allowsEditing: true,
      });
      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  // Validate email
  const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  // Xử lý submit cập nhật
  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      // Nếu avatar là file local, gửi dạng FormData
      let dataToUpdate;
      let isFormData = false;
      console.log('avatar', avatar);
      if (avatar && avatar.startsWith('file://')) {
        dataToUpdate = new FormData();
        dataToUpdate.append('first_name', firstName.trim());
        dataToUpdate.append('last_name', lastName.trim());
        dataToUpdate.append('username', username.trim());
        dataToUpdate.append('email', email.trim());
        dataToUpdate.append('avatar', {
          uri: avatar,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
        isFormData = true;
      } else {
        dataToUpdate = {
          avatar,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim(),
          email: email.trim(),
        };
      }

      // Gọi API updateUser, truyền thêm isFormData nếu cần
      const res = await updateUser(userToken, dataToUpdate, isFormData);


      if (res && (res.username || res.id)) {
        Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        updateUserInfoInContext(res);
        navigation.goBack();
      } else {
        Alert.alert('Lỗi', 'Cập nhật thất bại');
      }
    } catch (error) {
      console.log('Error updating user:', error, JSON.stringify(error));
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f7f9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Chỉnh sửa thông tin cá nhân</Text>

        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Chọn ảnh</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nhập họ"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nhập tên"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên đăng nhập *</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Nhập username"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cập nhật</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#f7f9ff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    color: '#004aad',
    textAlign: 'center',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#d6dde8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#7a869a',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccd3e0',
  },
  button: {
    backgroundColor: '#004aad',
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#7a9cd9',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});