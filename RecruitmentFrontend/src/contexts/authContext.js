// src/contexts/authContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Tạo context để quản lý trạng thái đăng nhập
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Kiểm tra thông tin người dùng từ localStorage khi ứng dụng được khởi tạo
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Lấy thông tin người dùng từ localStorage
    }
  }, []);

  // Đăng nhập và lưu trữ thông tin người dùng vào localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Đăng xuất và xóa thông tin người dùng khỏi localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
