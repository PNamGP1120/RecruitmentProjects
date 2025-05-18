import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Cập nhật thông tin người dùng (username, email, avatar,...)
 * @param {string} token - JWT access token
 * @param {object} data - { username?, email?, avatar? }
 * @returns {object} user
 */
export const updateUser = async (token, data) => {
  return apiRequest(ENDPOINTS.UPDATE_USER, 'PUT', token, data);
};

/**
 * Chuyển vai trò đang hoạt động (JobSeeker, Recruiter, Admin)
 * @param {string} token - JWT access token
 * @param {string} roleName - role_name string
 * @returns {object} { active_role, message }
 */
export const switchRole = async (token, roleName) => {
  return apiRequest(ENDPOINTS.SWITCH_ROLE, 'POST', token, { role_name: roleName });
};

/**
 * Lấy danh sách vai trò hệ thống
 * @returns {Array} [{ id, role_name, description }]
 */
export const getRoles = async () => {
  return apiRequest(ENDPOINTS.ROLES, 'GET');
};
