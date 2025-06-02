// src/api/request.js

import { API_URL } from './config';

/**
 * Gửi request đến API
 * @param {string} endpoint - Ví dụ: '/auth/user-info/'
 * @param {string} method - GET | POST | PUT | PATCH | DELETE
 * @param {string|null} token - JWT token nếu cần
 * @param {object|null} body - Dữ liệu gửi đi (JSON)
 * @returns {Promise<any>} - Kết quả trả về từ API
 */
export const apiRequest = async (endpoint, method = 'GET', token = null, body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data.detail || data.message || 'Có lỗi xảy ra';
    throw new Error(message);
  }

  return data;
};
