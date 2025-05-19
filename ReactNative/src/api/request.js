import { API_URL } from './config';

/**
 * Gửi request đến API
 * @param {string} endpoint - Ví dụ: '/auth/user-info/'
 * @param {string} method - GET | POST | PUT | PATCH | DELETE
 * @param {string|null} token - JWT token nếu cần
 * @param {object|null|FormData} body - Dữ liệu gửi đi (JSON hoặc FormData)
 * @returns {Promise<any>} - Kết quả trả về từ API
 */
export const apiRequest = async (endpoint, method = 'GET', token = null, body = null) => {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Nếu body là FormData thì KHÔNG set Content-Type, để fetch tự set boundary
  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // DEBUG: log body nếu là FormData
  if (isFormData) {
    for (let pair of body.entries()) {
      console.log('FormData:', pair[0], pair[1]);
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : null,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message = data.detail || data.message || 'Có lỗi xảy ra';
    throw new Error(message);
  }

  return data;
};