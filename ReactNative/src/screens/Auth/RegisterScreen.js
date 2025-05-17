import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { register } from '../../api/auth';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleRegister = async () => {
    if (!username || !email || !password || !password2) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường');
      return;
    }

    if (password !== password2) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    try {
      await register({ username, email, password, password2 });
      Alert.alert('Thành công', 'Đăng ký thành công. Vui lòng đăng nhập');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Lỗi đăng ký', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#004aad" />
      </TouchableOpacity>

      <Text style={styles.logo}>JobOU</Text>
      <Text style={styles.title}>Registration</Text>
      <Text style={styles.subtitle}>Let's Register. Apply to jobs!</Text>

      {/* Username */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="gray" />
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="gray" />
        <TextInput
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="gray" />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hidePassword}
        />
        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons name={hidePassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="gray" />
        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          value={password2}
          onChangeText={setPassword2}
          secureTextEntry={hidePassword}
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      {/* Or */}
      <Text style={styles.or}>Or continue with</Text>

      <View style={styles.socialRow}>
        <FontAwesome name="apple" size={28} />
        <FontAwesome name="google" size={28} color="#DB4437" />
        <FontAwesome name="facebook" size={28} color="#4267B2" />
      </View>

      <View style={styles.loginRedirect}>
        <Text>Have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#004aad', fontWeight: 'bold' }}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  logo: {
    marginTop: 50,
    color: '#004aad',
    fontSize: 26,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: '#004aad',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  or: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 15,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
