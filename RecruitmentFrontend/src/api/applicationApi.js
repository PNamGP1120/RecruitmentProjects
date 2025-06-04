// src/api/applicationApi.js

import axiosInstance, { ENDPOINTS } from './config';

// Đơn ứng tuyển

// Lấy danh sách đơn ứng tuyển của người tìm việc
export const getApplications = () => {
  return axiosInstance.get(ENDPOINTS.APPLICATIONS);
};

// Lấy chi tiết đơn ứng tuyển
export const getApplicationDetail = (id) => {
  const url = ENDPOINTS.APPLICATION_DETAIL.replace('{id}', id);
  return axiosInstance.get(url);
};

// Nộp đơn ứng tuyển vào một công việc
export const submitApplication = (jobId) => {
  return axiosInstance.post(ENDPOINTS.APPLICATIONS, { job_id: jobId });
};

// Cập nhật trạng thái đơn ứng tuyển
export const updateApplicationStatus = (id, status) => {
  const url = ENDPOINTS.APPLICATION_DETAIL.replace('{id}', id);
  return axiosInstance.patch(url, { status });
};

// Xóa đơn ứng tuyển (nếu chưa có phỏng vấn)
export const deleteApplication = (id) => {
  const url = ENDPOINTS.APPLICATION_DETAIL.replace('{id}', id);
  return axiosInstance.delete(url);
};

// Rút đơn ứng tuyển
export const withdrawApplication = (id) => {
  const url = ENDPOINTS.WITHDRAW_APPLICATION.replace('{id}', id);
  return axiosInstance.post(url);
};

// Gửi đề nghị nhận việc
export const offerApplication = (id) => {
  const url = ENDPOINTS.OFFER_APPLICATION.replace('{id}', id);
  return axiosInstance.post(url);
};

// Từ chối đơn ứng tuyển
export const rejectApplication = (id, reason) => {
  const url = ENDPOINTS.REJECT_APPLICATION.replace('{id}', id);
  return axiosInstance.post(url, { reason });
};

// Chấp nhận lời mời làm việc
export const acceptOffer = (id) => {
  const url = ENDPOINTS.ACCEPT_OFFER.replace('{id}', id);
  return axiosInstance.post(url);
};

// Lấy danh sách đơn ứng tuyển cho công việc cụ thể
export const getApplicationsByJob = (jobId) => {
  return axiosInstance.get(`${ENDPOINTS.APPLICATIONS_BY_JOB}?job_posting=${jobId}`);
};

// Phỏng vấn

// Lấy danh sách phỏng vấn có liên quan
export const getInterviews = () => {
  return axiosInstance.get(ENDPOINTS.INTERVIEWS);
};

// Lấy chi tiết buổi phỏng vấn
export const getInterviewDetail = (id) => {
  const url = ENDPOINTS.INTERVIEW_DETAIL.replace('{id}', id);
  return axiosInstance.get(url);
};

// Tạo buổi phỏng vấn cho một ứng viên
export const createInterview = (applicationId, interviewData) => {
  return axiosInstance.post(ENDPOINTS.CREATE_INTERVIEW, { application_id: applicationId, ...interviewData });
};

// Cập nhật lịch phỏng vấn
export const updateInterview = (id, interviewData) => {
  const url = ENDPOINTS.UPDATE_INTERVIEW.replace('{id}', id);
  return axiosInstance.patch(url, interviewData);
};

// Xóa buổi phỏng vấn
export const deleteInterview = (id) => {
  const url = ENDPOINTS.DELETE_INTERVIEW.replace('{id}', id);
  return axiosInstance.delete(url);
};

// Hủy buổi phỏng vấn
export const cancelInterview = (id) => {
  const url = ENDPOINTS.CANCEL_INTERVIEW.replace('{id}', id);
  return axiosInstance.post(url);
};

// Hoàn tất buổi phỏng vấn
export const completeInterview = (id) => {
  const url = ENDPOINTS.COMPLETE_INTERVIEW.replace('{id}', id);
  return axiosInstance.post(url);
};
