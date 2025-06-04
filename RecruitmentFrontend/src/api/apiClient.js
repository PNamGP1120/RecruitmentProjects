// src/api/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://192.168.1.7:8000'; // Thay bằng URL backend của bạn

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Thêm Authorization header nếu có token
apiClient.interceptors.request.use(
  async config => {
    const accessToken = await AsyncStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor xử lý refresh token nếu nhận response 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Gọi API refresh token
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;

        await AsyncStorage.setItem('access_token', newAccessToken);

        // Cập nhật token header và thử gửi lại request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Xử lý logout hoặc yêu cầu đăng nhập lại nếu refresh token hết hạn
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        // Có thể thêm event hoặc callback logout ở đây
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
