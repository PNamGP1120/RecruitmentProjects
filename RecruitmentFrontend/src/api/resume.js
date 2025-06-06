// src/api/resume.js
import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Lấy danh sách resume của user
 * @param {string} token - JWT access token
 * @returns {Array} Danh sách resume
 */
export const getResumes = async (token) => {
  return apiRequest(ENDPOINTS.RESUMES, 'GET', token);
};

/**
 * Upload resume mới
 * @param {string} token - JWT access token
 * @param {object} file - File object từ expo-document-picker
 * @param {string} title - Tiêu đề của resume
 * @returns {object} Resume sau khi upload
 */
export const uploadResume = async (token, file, title) => {
  const formData = new FormData();
  formData.append('file_path', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  });
  formData.append('title', title);
  return apiRequest(ENDPOINTS.RESUMES, 'POST', token, formData);
};

/**
 * Xóa resume
 * @param {string} token - JWT access token
 * @param {string} uuid - ID của resume
 * @returns {object} Kết quả xóa
 */
export const deleteResume = async (token, uuid) => {
  return apiRequest(ENDPOINTS.RESUME_DETAIL(uuid), 'DELETE', token);
};

/**
 * Lấy chi tiết một resume
 * @param {string} token - JWT access token
 * @param {string} uuid - ID của resume
 * @returns {object} Chi tiết resume
 */
export const getResumeDetail = async (token, uuid) => {
  return apiRequest(ENDPOINTS.RESUME_DETAIL(uuid), 'GET', token);
};

/**
 * Cập nhật thông tin resume
 * @param {string} token - JWT access token
 * @param {string} uuid - ID của resume
 * @param {object} data - Dữ liệu cần cập nhật
 * @returns {object} Resume sau khi cập nhật
 */
export const updateResume = async (token, uuid, data) => {
  let body = data;
  let isFormData = false;

  if (data.file_path && typeof data.file_path === 'object') {
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
 * Kích hoạt resume
 * @param {string} token - JWT access token
 * @param {string} uuid - ID của resume
 * @returns {object} Resume sau khi kích hoạt
 */
export const activateResume = async (token, uuid) => {
  return apiRequest(ENDPOINTS.RESUME_DETAIL(uuid) + 'activate/', 'POST', token);
};