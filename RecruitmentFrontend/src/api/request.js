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
  try {
    let headers = {};
    let fetchBody = null;

    if (body instanceof FormData) {
      fetchBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      fetchBody = body ? JSON.stringify(body) : null;
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log(`API Request: ${method} ${endpoint}`);
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: fetchBody,
    });

    // Kiểm tra status 204 No Content
    if (res.status === 204) {
      return null;
    }

    // Kiểm tra kiểu nội dung để tránh parse HTML thành JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error(`Server trả về không phải JSON: ${res.status} ${res.statusText}`);
      console.error(`Nội dung phản hồi: ${text.substring(0, 200)}...`);
      throw new Error(`Server trả về không phải JSON: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!res.ok) {
      const message = data.detail || data.message || 'Có lỗi xảy ra';
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error(`Lỗi API Request (${method} ${endpoint}):`, error);
    throw error;
  }
};
