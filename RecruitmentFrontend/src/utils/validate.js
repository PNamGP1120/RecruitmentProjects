// src/utils/validate.js

// Kiểm tra định dạng email hợp lệ
export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

// Kiểm tra mật khẩu (tối thiểu 6 ký tự)
export const validatePassword = (password) => {
  return password.length >= 6;
};

// Kiểm tra số điện thoại (với regex đơn giản)
export const validatePhoneNumber = (phoneNumber) => {
  const regex = /^\d{10}$/;
  return regex.test(phoneNumber);
};
