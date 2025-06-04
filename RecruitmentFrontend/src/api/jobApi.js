// src/api/jobApi.js

import axiosInstance, { ENDPOINTS } from './config';

// Quản lý hồ sơ nhà tuyển dụng

// Lấy danh sách hồ sơ nhà tuyển dụng
export const getRecruiters = () => {
  return axiosInstance.get(ENDPOINTS.RECRUITERS);
};

// Lấy chi tiết hồ sơ nhà tuyển dụng
export const getRecruiterDetail = (id) => {
  const url = ENDPOINTS.RECRUITER_DETAIL.replace('{id}', id);
  return axiosInstance.get(url);
};

// Tạo hồ sơ nhà tuyển dụng
export const createRecruiter = (recruiterData) => {
  return axiosInstance.post(ENDPOINTS.CREATE_RECRUITER, recruiterData);
};

// Cập nhật hồ sơ nhà tuyển dụng
export const updateRecruiter = (id, recruiterData) => {
  const url = ENDPOINTS.UPDATE_RECRUITER.replace('{id}', id);
  return axiosInstance.put(url, recruiterData);
};

// Xóa hồ sơ nhà tuyển dụng
export const deleteRecruiter = (id) => {
  const url = ENDPOINTS.DELETE_RECRUITER.replace('{id}', id);
  return axiosInstance.delete(url);
};

// Quản lý tin tuyển dụng

// Lấy danh sách tin tuyển dụng
export const getJobs = (params) => {
  return axiosInstance.get(ENDPOINTS.JOBS, { params });
};

// Lấy chi tiết tin tuyển dụng
export const getJobDetail = (id) => {
  const url = ENDPOINTS.JOB_DETAIL.replace('{id}', id);
  return axiosInstance.get(url);
};

// Tạo tin tuyển dụng mới
export const createJob = (jobData) => {
  return axiosInstance.post(ENDPOINTS.CREATE_JOB, jobData);
};

// Cập nhật tin tuyển dụng
export const updateJob = (id, jobData) => {
  const url = ENDPOINTS.UPDATE_JOB.replace('{id}', id);
  return axiosInstance.put(url, jobData);
};

// Xóa tin tuyển dụng
export const deleteJob = (id) => {
  const url = ENDPOINTS.DELETE_JOB.replace('{id}', id);
  return axiosInstance.delete(url);
};

// Tăng lượt xem tin tuyển dụng
export const incrementJobView = (id) => {
  const url = ENDPOINTS.INCREMENT_JOB_VIEW.replace('{id}', id);
  return axiosInstance.post(url);
};

// Gửi yêu cầu duyệt tin tuyển dụng (Draft → Pending)
export const submitJobForApproval = (id) => {
  const url = ENDPOINTS.SUBMIT_JOB_FOR_APPROVAL.replace('{id}', id);
  return axiosInstance.post(url);
};

// Lấy danh sách tin tuyển dụng đang chờ duyệt
export const getPendingJobs = () => {
  return axiosInstance.get(ENDPOINTS.PENDING_JOBS);
};

// Duyệt tin tuyển dụng (Pending → Approved)
export const approveJob = (id) => {
  const url = ENDPOINTS.APPROVE_JOB.replace('{id}', id);
  return axiosInstance.post(url);
};

// Từ chối tin tuyển dụng (Pending → Rejected)
export const rejectJob = (id, reason) => {
  const url = ENDPOINTS.REJECT_JOB.replace('{id}', id);
  return axiosInstance.post(url, { reason });
};

// Lấy tất cả tin tuyển dụng của nhà tuyển dụng
export const getRecruiterJobs = (id) => {
  const url = ENDPOINTS.RECRUITER_JOBS.replace('{id}', id);
  return axiosInstance.get(url);
};

// Lấy danh sách các loại công việc
export const getJobTypes = () => {
  return axiosInstance.get(ENDPOINTS.JOB_TYPES);
};

// Lấy danh sách các trạng thái tin tuyển dụng
export const getJobStatuses = () => {
  return axiosInstance.get(ENDPOINTS.JOB_STATUSES);
};

// Gợi ý việc làm dựa trên kỹ năng và hồ sơ người tìm việc
export const getJobRecommendations = () => {
  return axiosInstance.get(ENDPOINTS.JOB_RECOMMENDATIONS);
};
