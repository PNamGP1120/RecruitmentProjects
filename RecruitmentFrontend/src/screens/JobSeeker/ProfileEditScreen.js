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
import { updateUserPatch, uploadAvatar } from '../../api/user';

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setLoading(true);
        try {
          const res = await uploadAvatar(userToken, uri);
          if (res && res.avatar_url) {
            setAvatar(res.avatar_url);
            updateUserInfoInContext({ ...userInfo, avatar_url: res.avatar_url });
            Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
          } else {
            Alert.alert('Lỗi', 'Không nhận được avatar mới từ server');
          }
        } catch (err) {
          Alert.alert('Lỗi', err.message || 'Không thể upload avatar');
        }
        setLoading(false);
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
      const dataToUpdate = {
        avatar,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
      };
      console.log('dataToUpdate', dataToUpdate)

      const res = await updateUserPatch(userToken, dataToUpdate);
      console.log('res', res)
      // Kiểm tra thành công: nếu có username hoặc id trả về là ổn
      if (res && (res.username || res.id)) {

        Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        // Cập nhật context user với dữ liệu mới từ server
        updateUserInfoInContext(res);
        // navigation.goBack();
      } else {
        Alert.alert('Lỗi', 'Cập nhật thất bại');
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Personal Editing</Text>

        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Choose your avatar</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
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
            placeholder="Enter your email"
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
            <Text style={styles.buttonText}>Update</Text>
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
