// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { login as apiLogin, logout as apiLogout } from '../api/authApi';

const useAuth = () => {
  const { user, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (user) {
      // Redirect nếu đã đăng nhập
      history.push('/dashboard');
    }
  }, [user, history]);

  // Đăng nhập
  const loginUser = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(username, password);
      login(response.user);
      history.push('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng xuất
  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      logout();
      history.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { user, loginUser, logoutUser, isLoading };
};

export default useAuth;
