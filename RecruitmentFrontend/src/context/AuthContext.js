import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // user object hoặc null
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user từ AsyncStorage khi app mở
    async function loadUser() {
      try {
        const jsonUser = await AsyncStorage.getItem('user');
        if (jsonUser) setUser(JSON.parse(jsonUser));
      } catch (e) {
        console.log('Error loading user:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
