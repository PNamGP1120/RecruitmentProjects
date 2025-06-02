import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {login as apiLogin, getCurrentUser, login} from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
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
        try {
            const data = await login(username, password);
            if (!data.access) {
                throw new Error('Không nhận được token từ server');
            }

            // Lưu token vào AsyncStorage
            await AsyncStorage.setItem('userToken', data.access);

            // Lấy thông tin user
            const userInfo = await getCurrentUser(data.access);
            if (!userInfo) {
                throw new Error('Không thể lấy thông tin người dùng');
            }

            setUserToken(data.access);
            setUserInfo(userInfo);
        } catch (error) {
            // Xóa token nếu có lỗi
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
            setUserInfo(null);
            throw error;
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
        setUserInfo(null);
    };

    // Hàm cập nhật thông tin user mới trong context
    const updateUserInfoInContext = (newUserInfo) => {
        setUserInfo(prevUserInfo => ({
            ...prevUserInfo,
            ...newUserInfo,
        }));
    };

    return (
        <AuthContext.Provider
          value={{
            userToken,
            userInfo,
            loading,
            signIn,
            signOut,
            updateUserInfoInContext, // expose hàm này để dùng trong component khác
          }}
        >
            {children}
        </AuthContext.Provider>
    );
};
