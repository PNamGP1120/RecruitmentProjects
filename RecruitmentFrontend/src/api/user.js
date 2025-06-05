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
 * Cập nhật thông tin người dùng bằng PATCH (dùng cho update từng trường)
 * @param {string} token - JWT access token
 * @param {object} data - { username?, email?, first_name?, last_name?, avatar? }
 * @returns {object} user sau khi update
 */
export const updateUserPatch = async (token, data) => {
  let body;
  let isFormData = false;

  if (data.avatar && data.avatar instanceof File) {
    isFormData = true;
    body = new FormData();
    for (const key in data) {
      if (key !== 'avatar' && data[key] !== undefined) {
        body.append(key, data[key]);
      }
    }
    body.append('avatar', data.avatar);
  } else {
    body = data;
  }

  // PATCH tới endpoint update user
  return apiRequest(
    ENDPOINTS.UPDATE_USER,
    'PATCH',
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

/**
 * Lấy danh sách resume
 * @param {string} token
 */
export const getResumes = async (token) => {
  return apiRequest(ENDPOINTS.RESUMES, 'GET', token);
};

/**
 * Upload resume (file)
 * @param {string} token
 * @param {File|Blob} file
 * @param {string} title
 */
export const uploadResume = async (token, file, title) => {
  const formData = new FormData();
  formData.append('file_path', file);
  formData.append('title', title);
  return apiRequest(ENDPOINTS.RESUMES, 'POST', token, formData);
};

/**
 * Xóa resume
 * @param {string} token
 * @param {string} uuid
 */
export const deleteResume = async (token, uuid) => {
  return apiRequest(ENDPOINTS.RESUME_DETAIL(uuid), 'DELETE', token);
};

/**
 * Lấy chi tiết 1 resume
 * @param {string} token
 * @param {string} uuid
 */
export const getResumeDetail = async (token, uuid) => {
  return apiRequest(ENDPOINTS.RESUME_DETAIL(uuid), 'GET', token);
};

/**
 * Cập nhật 1 resume (PATCH)
 * @param {string} token
 * @param {string} uuid
 * @param {object} data
 */
export const updateResume = async (token, uuid, data) => {
  let body = data;
  let isFormData = false;
  if (data.file_path && typeof data.file_path === 'object') {
    // Nếu có file mới, dùng FormData
    isFormData = true;
    body = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        body.append(key, data[key]);
      }
    }
  }
  return apiRequest(ENDPOINTS.RESUME_DETAIL(uuid), 'PATCH', token, body);
};

/**
 * Kích hoạt resume (active)
 * @param {string} token
 * @param {string} uuid
 */
export const activateResume = async (token, uuid) => {
  return apiRequest(ENDPOINTS.RESUME_DETAIL(uuid) + 'activate/', 'POST', token);
};

/**
 * Upload avatar cho user
 * @param {string} token - JWT access token
 * @param {File|Blob|string} avatar - file hoặc uri ảnh
 * @returns {object} user info mới
 */
export const uploadAvatar = async (token, avatar) => {
  const formData = new FormData();
  // Nếu là uri (từ expo-image-picker), cần chuyển thành file object
  if (typeof avatar === 'string') {
    // Đoán tên file và loại mime
    const filename = avatar.split('/').pop();
    const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    formData.append('avatar', {
      uri: avatar,
      name: filename,
      type,
    });
  } else {
    formData.append('avatar', avatar);
  }
  return apiRequest(ENDPOINTS.AVATAR_UPLOAD, 'POST', token, formData);
};

/**
 * Lấy danh sách kỹ năng
 * @returns {Array} [{ id, name }]
 */
export const getSkills = async (token) => {
  return apiRequest(ENDPOINTS.SKILLS, 'GET', token);
};

// Hàm previewResume và editResume sẽ được dùng ở màn hình chi tiết và chỉnh sửa
