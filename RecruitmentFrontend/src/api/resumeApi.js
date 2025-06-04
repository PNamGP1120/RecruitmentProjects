// src/api/resumeApi.js

import axiosInstance, { ENDPOINTS } from './config';

// API liên quan đến kỹ năng

// Lấy danh sách kỹ năng
export const getSkills = () => {
  return axiosInstance.get(ENDPOINTS.SKILLS);
};

// Tạo kỹ năng mới
export const createSkill = (name, description) => {
  return axiosInstance.post(ENDPOINTS.SKILLS, { name, description });
};

// Lấy chi tiết kỹ năng
export const getSkillDetail = (id) => {
  const url = ENDPOINTS.SKILL_DETAIL.replace('{id}', id);
  return axiosInstance.get(url);
};

// Cập nhật kỹ năng
export const updateSkill = (id, description) => {
  const url = ENDPOINTS.SKILL_DETAIL.replace('{id}', id);
  return axiosInstance.patch(url, { description });
};

// Xóa kỹ năng
export const deleteSkill = (id) => {
  const url = ENDPOINTS.SKILL_DETAIL.replace('{id}', id);
  return axiosInstance.delete(url);
};

// API liên quan đến hồ sơ người tìm việc

// Lấy danh sách hồ sơ người tìm việc
export const getJobSeekerProfiles = () => {
  return axiosInstance.get(ENDPOINTS.JOB_SEEKER_PROFILES);
};

// Tạo hồ sơ người tìm việc mới
export const createJobSeekerProfile = (summary, skills_ids, phone_number, gender) => {
  return axiosInstance.post(ENDPOINTS.JOB_SEEKER_PROFILES, { summary, skills_ids, phone_number, gender });
};

// Lấy chi tiết hồ sơ người tìm việc
export const getJobSeekerProfileDetail = (id) => {
  const url = ENDPOINTS.JOB_SEEKER_PROFILE_DETAIL.replace('{id}', id);
  return axiosInstance.get(url);
};

// Cập nhật hồ sơ người tìm việc
export const updateJobSeekerProfile = (id, summary) => {
  const url = ENDPOINTS.JOB_SEEKER_PROFILE_DETAIL.replace('{id}', id);
  return axiosInstance.patch(url, { summary });
};

// Xóa hồ sơ người tìm việc
export const deleteJobSeekerProfile = (id) => {
  const url = ENDPOINTS.JOB_SEEKER_PROFILE_DETAIL.replace('{id}', id);
  return axiosInstance.delete(url);
};

// Lấy danh sách CV theo hồ sơ người tìm việc
export const getJobSeekerResumes = (id) => {
  const url = ENDPOINTS.JOB_SEEKER_RESUMES.replace('{id}', id);
  return axiosInstance.get(url);
};

// Tìm kiếm hồ sơ theo từ khóa
export const searchJobSeekerProfiles = (keyword) => {
  return axiosInstance.get(`${ENDPOINTS.JOB_SEEKER_PROFILES}?search=${keyword}`);
};

// Lấy hồ sơ người dùng hiện tại
export const getCurrentJobSeekerProfile = () => {
  return axiosInstance.get(ENDPOINTS.JOB_SEEKER_PROFILE_ME);
};

// API liên quan đến CV

// Lấy danh sách CV
export const getResumes = () => {
  return axiosInstance.get(ENDPOINTS.RESUMES);
};

// Tải lên CV mới
export const uploadResume = (job_seeker_id, title, file) => {
  const formData = new FormData();
  formData.append('job_seeker_id', job_seeker_id);
  formData.append('title', title);
  formData.append('file', file);
  return axiosInstance.post(ENDPOINTS.RESUMES, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Lấy chi tiết CV
export const getResumeDetail = (id) => {
  const url = ENDPOINTS.RESUME_DETAIL.replace('{id}', id);
  return axiosInstance.get(url);
};

// Cập nhật CV
export const updateResume = (id, title) => {
  const url = ENDPOINTS.RESUME_DETAIL.replace('{id}', id);
  return axiosInstance.patch(url, { title });
};

// Xóa CV
export const deleteResume = (id) => {
  const url = ENDPOINTS.RESUME_DETAIL.replace('{id}', id);
  return axiosInstance.delete(url);
};

// Kích hoạt CV
export const activateResume = (id) => {
  const url = ENDPOINTS.ACTIVATE_RESUME.replace('{id}', id);
  return axiosInstance.post(url);
};

// Tìm kiếm CV theo tiêu đề
export const searchResumes = (keyword) => {
  return axiosInstance.get(`${ENDPOINTS.RESUMES}?search=${keyword}`);
};
