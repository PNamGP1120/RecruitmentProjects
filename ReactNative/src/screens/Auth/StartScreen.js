import React from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function StartScreen({ navigation }) {
  return (
    <LinearGradient colors={['#ffffff', '#c2dfff']} style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.buttonText, styles.registerButtonText]}>Đăng ký</Text>
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
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.5,
    height: height * 0.25,
    marginBottom: 50,
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  registerButtonText: {
    color: '#0066cc',
  },
});
