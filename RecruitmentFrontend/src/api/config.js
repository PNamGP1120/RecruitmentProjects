// src/api/config.js

import axios from 'axios';

// Địa chỉ API backend
export const BASE_URL = 'https://192.168.1.7:8000'; // Cập nhật lại nếu cần

// Định nghĩa các endpoint API
export const ENDPOINTS = {
  // Các endpoint liên quan đến Auth
  REGISTER: 'auth/register/',
  LOGIN: 'auth/login/',
  LOGOUT: 'auth/logout/',
  REFRESH_TOKEN: 'auth/token/refresh/',
  USER_INFO: 'auth/user_info/',
  UPDATE_USER: 'auth/update_user/',
  CHANGE_PASSWORD: 'auth/change_password/',
  ROLES: 'roles/',
  USER_ROLES: 'user-roles/',
  REQUEST_ROLE: 'user-roles/request_role/',
  ACTIVATE_ROLE: 'user-roles/activate/',
  PENDING_ROLE_REQUESTS: 'admin/user-roles/pending/',
  APPROVE_ROLE_REQUEST: 'admin/user-roles/approve/',
  ASSIGN_ADMIN_ROLE: 'admin/user-roles/assign_admin/',
  EMAIL_VERIFY_SEND: 'auth/email_verify_send/',
  EMAIL_VERIFY_CONFIRM: 'auth/email_verify_confirm/',
  PASSWORD_RESET_REQUEST: 'auth/password_reset_request/',
  PASSWORD_RESET_CONFIRM: 'auth/password_reset_confirm/',
  AVATAR_UPLOAD: 'auth/avatar_upload/',
  AVATAR_URL: 'auth/avatar/',

  // Quản lý nhà tuyển dụng
  RECRUITERS: 'recruiters/',
  RECRUITER_DETAIL: 'recruiters/{id}/',
  CREATE_RECRUITER: 'recruiters/',
  UPDATE_RECRUITER: 'recruiters/{id}/',
  DELETE_RECRUITER: 'recruiters/{id}/',

  // Quản lý tin tuyển dụng
  JOBS: 'jobs/',
  JOB_DETAIL: 'jobs/{id}/',
  CREATE_JOB: 'jobs/',
  UPDATE_JOB: 'jobs/{id}/',
  DELETE_JOB: 'jobs/{id}/',
  INCREMENT_JOB_VIEW: 'jobs/{id}/increment_view/',
  SUBMIT_JOB_FOR_APPROVAL: 'jobs/{id}/submit_for_approval/',
  PENDING_JOBS: 'admin/jobs/pending/',
  APPROVE_JOB: 'admin/jobs/{id}/approve/',
  REJECT_JOB: 'admin/jobs/{id}/reject/',
  RECRUITER_JOBS: 'recruiters/{id}/jobs/',

  // Các thông tin khác về công việc
  JOB_TYPES: 'jobs/types/',
  JOB_STATUSES: 'jobs/statuses/',
  JOB_RECOMMENDATIONS: 'jobs/recommend/',

  // Kỹ năng
  SKILLS: 'skills/',
  SKILL_DETAIL: 'skills/{id}/',

  // Hồ sơ người tìm việc
  JOB_SEEKER_PROFILES: 'job-seeker-profiles/',
  JOB_SEEKER_PROFILE_DETAIL: 'job-seeker-profiles/{id}/',
  JOB_SEEKER_PROFILE_ME: 'job-seeker-profiles/me/',
  JOB_SEEKER_RESUMES: 'job-seeker-profiles/{id}/resumes/',

  // CV
  RESUMES: 'resumes/',
  RESUME_DETAIL: 'resumes/{id}/',
  ACTIVATE_RESUME: 'resumes/{id}/activate/',

  // Đơn ứng tuyển
  APPLICATIONS: 'applications/',
  APPLICATION_DETAIL: 'applications/{id}/',
  WITHDRAW_APPLICATION: 'applications/{id}/withdraw/',
  OFFER_APPLICATION: 'applications/{id}/offer/',
  REJECT_APPLICATION: 'applications/{id}/reject/',
  ACCEPT_OFFER: 'applications/{id}/accept-offer/',
  APPLICATIONS_BY_JOB: 'recruiter/applications/',

  // Phỏng vấn
  INTERVIEWS: 'interviews/',
  INTERVIEW_DETAIL: 'interviews/{id}/',
  CREATE_INTERVIEW: 'interviews/',
  UPDATE_INTERVIEW: 'interviews/{id}/',
  DELETE_INTERVIEW: 'interviews/{id}/',
  CANCEL_INTERVIEW: 'interviews/{id}/cancel/',
  COMPLETE_INTERVIEW: 'interviews/{id}/complete/',

  // Báo cáo cho Recruiter
  RECRUITER_STATS: 'report/recruiter/stats/',
  JOB_PERFORMANCE: 'report/recruiter/job-performance/',
  APPLICANT_STATUS: 'report/recruiter/applicant-status/',
  ACTIVITY_LOG: 'report/recruiter/activity-log/',

  // Báo cáo cho JobSeeker
  RESUME_VIEWS: 'report/jobseeker/resume-views/',
  RESPONSE_RATE: 'report/jobseeker/response-rate/',
  APPLICATION_HISTORY: 'report/jobseeker/application-history/',
  JOB_SUGGESTIONS: 'report/jobseeker/job-suggestions/',

  // Báo cáo cho Admin
  SYSTEM_SUMMARY: 'report/system/summary/',
  SYSTEM_TRENDS: 'report/system/trends/',
  NOTIFICATIONS: 'report/system/notifications/',
  EXPORT_REPORT: 'report/export/',
  METRICS: 'report/metrics/',

  // Tạo và xuất báo cáo
  GENERATE_REPORT: 'report/generate/',
};

// Cấu hình chung cho axios
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Nếu đã có token (JWT), thêm vào header Authorization
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
