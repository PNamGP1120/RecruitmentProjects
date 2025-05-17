import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, getCurrentUser } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);
        try {
          const user = await getCurrentUser(token);
          setUserInfo(user);
        } catch {
          setUserToken(null);
          setUserInfo(null);
          await AsyncStorage.removeItem('userToken');
        }
      }
      setLoading(false);
    }
    loadToken();
  }, []);

  const signIn = async (username, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      await AsyncStorage.setItem('userToken', data.access);
      setUserToken(data.access);

      const user = await getCurrentUser(data.access);
      setUserInfo(user);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userInfo, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
