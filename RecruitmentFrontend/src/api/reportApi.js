// src/api/reportApi.js

import axiosInstance, { ENDPOINTS } from './config';

// API Báo cáo cho Recruiter

// Thống kê hồ sơ ứng tuyển, tỉ lệ tuyển thành công
export const getRecruiterStats = () => {
  return axiosInstance.get(ENDPOINTS.RECRUITER_STATS);
};

// Báo cáo hiệu quả tin tuyển dụng: lượt xem, ứng tuyển, thời gian tuyển
export const getJobPerformanceReport = () => {
  return axiosInstance.get(ENDPOINTS.JOB_PERFORMANCE);
};

// Tỉ lệ ứng viên theo trạng thái ứng tuyển
export const getApplicantStatusReport = () => {
  return axiosInstance.get(ENDPOINTS.APPLICANT_STATUS);
};

// Lịch sử hoạt động tuyển dụng
export const getRecruiterActivityLog = () => {
  return axiosInstance.get(ENDPOINTS.ACTIVITY_LOG);
};

// API Báo cáo cho JobSeeker

// Tổng lượt xem hồ sơ, lượt tải CV, lượt ứng tuyển
export const getResumeViewsReport = () => {
  return axiosInstance.get(ENDPOINTS.RESUME_VIEWS);
};

// Tỉ lệ phản hồi từ nhà tuyển dụng
export const getResponseRateReport = () => {
  return axiosInstance.get(ENDPOINTS.RESPONSE_RATE);
};

// Lịch sử ứng tuyển chi tiết
export const getApplicationHistory = () => {
  return axiosInstance.get(ENDPOINTS.APPLICATION_HISTORY);
};

// Báo cáo gợi ý công việc phù hợp
export const getJobSuggestionsReport = () => {
  return axiosInstance.get(ENDPOINTS.JOB_SUGGESTIONS);
};

// API Báo cáo cho Admin

// Tổng quan số user, tin tuyển dụng, ứng tuyển
export const getSystemSummaryReport = () => {
  return axiosInstance.get(ENDPOINTS.SYSTEM_SUMMARY);
};

// Xu hướng tuyển dụng theo thời gian
export const getSystemTrendsReport = () => {
  return axiosInstance.get(ENDPOINTS.SYSTEM_TRENDS);
};

// Thống kê hiệu quả các thông báo
export const getNotificationsReport = () => {
  return axiosInstance.get(ENDPOINTS.NOTIFICATIONS);
};

// Xuất báo cáo ra file Excel hoặc PDF
export const exportReport = (format) => {
  return axiosInstance.get(`${ENDPOINTS.EXPORT_REPORT}?format=${format}`);
};

// Lấy các chỉ số KPI tùy chỉnh
export const getMetricsReport = () => {
  return axiosInstance.get(ENDPOINTS.METRICS);
};

// Tạo báo cáo tùy chỉnh theo tham số input
export const generateCustomReport = (reportData) => {
  return axiosInstance.post(ENDPOINTS.GENERATE_REPORT, reportData);
};
