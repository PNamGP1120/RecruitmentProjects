import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

const {width, height} = Dimensions.get('window');

export default function StartScreen({navigation}) {
    return (
        <LinearGradient
            colors={['#ffffff', '#c2dfff']}
            style={styles.container}
        >
            {/* Logo */}
            <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            {/* Nội dung chính */}
            <View style={styles.content}>
                <Text style={styles.title}>Chào mừng đến với JobOU</Text>
                <Text style={styles.subtitle}>Tìm việc nhanh chóng và dễ dàng</Text>
            </View>

            {/* Nút đăng nhập & đăng ký */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginText}>Đăng nhập</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.registerText}>Đăng ký</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: width * 0.6,
    height: height * 0.2,
    marginBottom: 30,
  },
  content: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004aad',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#004aad',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#004aad',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#004aad',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
