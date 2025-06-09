import React, {createContext, useState, useEffect, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {login as apiLogin, getCurrentUser, login} from '../api/auth';
import { auth } from '../utils/rnFirebase';

export const AuthContext = createContext();

// Hook useAuth để sử dụng context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng trong AuthProvider');
    }
    return context;
};

export const AuthProvider = ({children}) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listener cho trạng thái đăng nhập Firebase
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(firebaseUser => {
            console.log("Firebase auth state changed:", firebaseUser);
            // Có thể thêm logic xử lý khi trạng thái Firebase Auth thay đổi
        });
        
        // Cleanup function
        return () => subscriber();
    }, []);
    
    // Load token từ AsyncStorage khi component mount
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

    // Hàm đăng nhập
    const signIn = async (username, password) => {
        try {
            // Đăng nhập với API backend
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

            // Có thể thêm đăng nhập Firebase ở đây nếu cần
            // await auth().signInWithCustomToken(firebaseToken);
        } catch (error) {
            // Xóa token nếu có lỗi
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
            setUserInfo(null);
            throw error;
        }
    };

    // Hàm đăng xuất
    const signOut = async () => {
        try {
            // Đăng xuất khỏi Firebase
            await auth().signOut();
            
            // Xóa token và thông tin user
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
            setUserInfo(null);
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            // Vẫn xóa token và thông tin user ngay cả khi có lỗi
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
            setUserInfo(null);
        }
    };

    // Hàm cập nhật thông tin user
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
            updateUserInfoInContext,
          }}
        >
            {children}
        </AuthContext.Provider>
    );
};