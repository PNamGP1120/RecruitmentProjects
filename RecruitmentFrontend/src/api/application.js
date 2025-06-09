import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Lấy danh sách đơn ứng tuyển của user hiện tại
 * @param {string} token - JWT access token
 * @param {object} params - Tham số lọc (nếu có)
 * @returns {Promise<object>} Danh sách đơn ứng tuyển
 */
export const getApplications = async (token, params = {}) => {
  // params có thể gồm: status, limit, offset, ...
  return apiRequest(ENDPOINTS.MY_APPLICATIONS, 'GET', token, null, params);
};

// Nộp đơn ứng tuyển mới
export const createApplication = async (token, data) => {
  // data: { job_posting, resume, cover_letter }
  return apiRequest(ENDPOINTS.CREATE_APPLICATION, 'POST', token, data);
};

export const getApplicationDetail = async (token, id) => {
  return apiRequest(ENDPOINTS.APPLICATION_DETAIL(id), 'GET', token);
};

export const withdrawApplication = async (token, id) => {
  return apiRequest(ENDPOINTS.APPLICATION_WITHDRAW(id), 'POST', token);
};

/**
 * Chấp nhận offer từ nhà tuyển dụng
 * @param {string} token - JWT token
 * @param {string} applicationId - ID của đơn ứng tuyển
 * @returns {Promise<Object>} Kết quả chấp nhận offer
 */
export const acceptOffer = async (token, applicationId) => {
    try {
        const response = await apiRequest(
            ENDPOINTS.APPLICATION_ACCEPT_OFFER(applicationId), 
            'POST', 
            token,
            { confirm: true }
        );
        return response;
    } catch (error) {
        console.error('Error in acceptOffer:', error);
        throw error;
    }
};

/**
 * Từ chối offer từ nhà tuyển dụng
 * @param {string} token - JWT token
 * @param {string} applicationId - ID của đơn ứng tuyển
 * @returns {Promise<Object>} Kết quả từ chối offer
 */
export const rejectOffer = async (token, applicationId) => {
    try {
        const response = await apiRequest(ENDPOINTS.APPLICATION_REJECT_OFFER(applicationId), 'POST', token);
        return response;
    } catch (error) {
        console.error('Error in rejectOffer:', error);
        throw error;
    }
};  