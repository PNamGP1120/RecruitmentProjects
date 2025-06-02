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

  // Nếu có avatar là File (upload mới), dùng FormData
  if (data.avatar && data.avatar instanceof File) {
    isFormData = true;
    body = new FormData();

    // Thêm các trường text
    for (const key in data) {
      if (key !== 'avatar' && data[key] !== undefined) {
        body.append(key, data[key]);
      }
    }
    // Thêm file avatar
    body.append('avatar', data.avatar);
  } else {
    // Nếu avatar là string url hoặc không có avatar, gửi JSON bình thường
    body = data;
  }

  // Gọi apiRequest với method PUT tới endpoint update user
  return apiRequest(
    ENDPOINTS.UPDATE_USER,
    'PUT',
    token,
    isFormData ? body : body
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
