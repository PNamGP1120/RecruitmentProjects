// Trong RecruitmentFrontend/src/api/jobSeekerProfile.js
import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Lấy thông tin profile của job seeker
 * @param {string} token - JWT access token
 * @returns {object} profile data
 */
export const getJobSeekerProfile = async (token) => {
  return apiRequest(ENDPOINTS.JOB_SEEKER_PROFILE, 'GET', token);
};

/**
 * Tạo mới profile cho job seeker
 * @param {string} token - JWT access token
 * @param {object} profileData - Dữ liệu profile
 * @returns {object} profile sau khi tạo
 */
export const createJobSeekerProfile = async (token, profileData) => {
  return apiRequest(ENDPOINTS.JOB_SEEKER_PROFILE_CREATE, 'POST', token, {
    summary: profileData.summary,
    experience: profileData.experience,
    education: profileData.education,
    phone_number: profileData.phone_number,
    date_of_birth: profileData.date_of_birth,
    gender: profileData.gender,
    skills_ids: profileData.skills,
  });
};

/**
 * Cập nhật profile của job seeker
 * @param {string} token - JWT access token
 * @param {string} profileId - ID của profile
 * @param {object} profileData - Dữ liệu cần cập nhật
 * @returns {object} profile sau khi cập nhật
 */
export const updateJobSeekerProfile = async (token, profileId, profileData) => {
  return apiRequest(ENDPOINTS.JOB_SEEKER_PROFILE_UPDATE(profileId), 'PATCH', token, {
    summary: profileData.summary,
    experience: profileData.experience,
    education: profileData.education,
    phone_number: profileData.phone_number,
    date_of_birth: profileData.date_of_birth,
    gender: profileData.gender,
    skills_ids: profileData.skills,
  });
};
