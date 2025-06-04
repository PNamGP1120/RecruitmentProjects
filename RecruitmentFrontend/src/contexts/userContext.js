// src/contexts/userContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Tạo context để quản lý thông tin người dùng và vai trò
const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    roles: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  const updateUserInfo = (newInfo) => {
    setUserInfo((prevInfo) => ({ ...prevInfo, ...newInfo }));
    localStorage.setItem('user', JSON.stringify({ ...userInfo, ...newInfo }));
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
