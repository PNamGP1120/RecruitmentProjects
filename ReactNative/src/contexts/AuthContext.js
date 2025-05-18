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
            const userInfo = await getCurrentUser(data.access);

            setUserToken(data.access);
            setUserInfo(userInfo);

            // Không điều hướng ở đây
        } catch (error) {
            throw error;
        }
    };


    const signOut = async () => {
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
        setUserInfo(null);
    };

    return (
        <AuthContext.Provider value={{userToken, userInfo, loading, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    );
};
