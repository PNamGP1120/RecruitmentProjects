// src/api/jobSeeker.js
import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Lấy danh sách phỏng vấn của JobSeeker
 * @param {string} token - JWT token
 * @param {Object} params - Các tham số lọc
 * @returns {Promise<Array>} Danh sách phỏng vấn
 */
export const getJobSeekerInterviews = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.INTERVIEWS}${queryString ? `?${queryString}` : ''}`;
        console.log('Fetching interviews with endpoint:', endpoint); // Thêm log
        const response = await apiRequest(endpoint, 'GET', token);
        console.log('Interview response:', response); // Thêm log
        return response;
    } catch (error) {
        console.error('Error in getJobSeekerInterviews:', error);
        throw error;
    }
};