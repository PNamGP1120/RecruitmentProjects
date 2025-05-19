import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Cập nhật thông tin người dùng (username, email, avatar,...)
 * @param {string} token - JWT access token
 * @param {object} data - { username?, email?, first_name?, last_name?, avatar? (string url hoặc File) }
 * @returns {object} user sau khi update
 */
export const updateUser = async (token, data) => {
  let body;
  let isFormData = false;

  // Nếu avatar là file local (object có uri), gửi FormData
  if (data.avatar && typeof data.avatar === 'object' && data.avatar.uri) {
    isFormData = true;
    body = new FormData();
    for (const key in data) {
      if (key !== 'avatar' && data[key] !== undefined) {
        body.append(key, data[key]);
      }
    }
    body.append('avatar', {
      uri: data.avatar.uri,
      name: data.avatar.name || 'avatar.jpg',
      type: data.avatar.type || 'image/jpeg',
    });
  } else {
    // Nếu avatar là string url hoặc không có avatar, KHÔNG gửi avatar
    const { avatar, ...rest } = data;
    body = rest;
  }

  return apiRequest(
    ENDPOINTS.UPDATE_USER,
    'PUT',
    token,
    body
  );
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
