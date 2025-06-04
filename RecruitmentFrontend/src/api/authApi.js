// src/api/authApi.js

import axiosInstance, { ENDPOINTS } from './config';

// Đăng ký người dùng mới
export const register = (username, email, password, password2) => {
  return axiosInstance.post(ENDPOINTS.REGISTER, {
    username,
    email,
    password,
    password2,
  });
};

// Đăng nhập
export const login = (username, password) => {
  return axiosInstance.post(ENDPOINTS.LOGIN, { username, password });
};

// Đăng xuất
export const logout = () => {
  return axiosInstance.post(ENDPOINTS.LOGOUT, {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`,
    },
  });
};

// Làm mới token JWT
export const refreshToken = (refreshToken) => {
  return axiosInstance.post(ENDPOINTS.REFRESH_TOKEN, { refresh: refreshToken });
};

// Lấy thông tin người dùng
export const getUserInfo = () => {
  return axiosInstance.get(ENDPOINTS.USER_INFO, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`,
    },
  });
};

// Cập nhật thông tin người dùng
export const updateUserInfo = (userData) => {
  return axiosInstance.put(ENDPOINTS.UPDATE_USER, userData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`,
    },
  });
};

// Đổi mật khẩu
export const changePassword = (oldPassword, newPassword) => {
  return axiosInstance.post(ENDPOINTS.CHANGE_PASSWORD, {
    old_password: oldPassword,
    new_password: newPassword,
  });
};

// Lấy danh sách vai trò
export const getRoles = () => {
  return axiosInstance.get(ENDPOINTS.ROLES);
};

// Lấy các vai trò người dùng
export const getUserRoles = () => {
  return axiosInstance.get(ENDPOINTS.USER_ROLES, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`,
    },
  });
};

// Gửi yêu cầu role mới
export const requestRole = (roleName) => {
  return axiosInstance.post(ENDPOINTS.REQUEST_ROLE, { role_name: roleName }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`,
    },
  });
};

// Kích hoạt role hiện tại
export const activateRole = (roleName) => {
  return axiosInstance.patch(ENDPOINTS.ACTIVATE_ROLE, { role_name: roleName }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`,
    },
  });
};

// Gửi yêu cầu xác thực email
export const sendEmailVerification = (email) => {
  return axiosInstance.post(ENDPOINTS.EMAIL_VERIFY_SEND, { email });
};

// Xác nhận email
export const confirmEmailVerification = (token) => {
  return axiosInstance.post(ENDPOINTS.EMAIL_VERIFY_CONFIRM, { token });
};

// Yêu cầu reset mật khẩu
export const requestPasswordReset = (email) => {
  return axiosInstance.post(ENDPOINTS.PASSWORD_RESET_REQUEST, { email });
};

// Xác nhận reset mật khẩu
export const confirmPasswordReset = (token, newPassword) => {
  return axiosInstance.post(ENDPOINTS.PASSWORD_RESET_CONFIRM, { token, new_password: newPassword });
};

// Upload avatar
export const uploadAvatar = (avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);

  return axiosInstance.post(ENDPOINTS.AVATAR_UPLOAD, formData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Lấy URL ảnh đại diện
export const getAvatarUrl = () => {
  return axiosInstance.get(ENDPOINTS.AVATAR, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`,
    },
  });
};
