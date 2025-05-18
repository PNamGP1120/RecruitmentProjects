// src/api/auth.js

import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Đăng nhập
 * @param {string} username
 * @param {string} password
 * @returns {object} { access, refresh }
 */
export const login = async (username, password) => {
  return apiRequest(ENDPOINTS.LOGIN, 'POST', null, { username, password });
};

/**
 * Đăng ký tài khoản
 * @param {object} body - { username, email, password, password2 }
 */
export const register = async ({ username, email, password, password2 }) => {
  return apiRequest(ENDPOINTS.REGISTER, 'POST', null, {
    username,
    email,
    password,
    password2,
  });
};

/**
 * Lấy thông tin người dùng đang đăng nhập
 * @param {string} token
 * @returns {object} user info
 */
export const getCurrentUser = async (token) => {
  return apiRequest(ENDPOINTS.CURRENT_USER, 'GET', token);
};
