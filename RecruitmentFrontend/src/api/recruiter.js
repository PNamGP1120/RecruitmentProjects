import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Lấy thông tin hồ sơ nhà tuyển dụng
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Thông tin hồ sơ nhà tuyển dụng
 */
export const getRecruiterProfile = async (token) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.PROFILE, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getRecruiterProfile:', error);
        throw error;
    }
};

/**
 * Cập nhật một phần thông tin hồ sơ nhà tuyển dụng
 * @param {string} token - JWT token
 * @param {Object} data - Dữ liệu cần cập nhật
 * @returns {Promise<Object>} Thông tin hồ sơ đã cập nhật
 */
export const updateRecruiterProfile = async (token, data) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.PROFILE, 'PATCH', token, data);
        return response;
    } catch (error) {
        console.error('Error in updateRecruiterProfile:', error);
        throw error;
    }
};

/**
 * Cập nhật toàn bộ thông tin hồ sơ nhà tuyển dụng
 * @param {string} token - JWT token
 * @param {Object} data - Dữ liệu cần cập nhật
 * @returns {Promise<Object>} Thông tin hồ sơ đã cập nhật
 */
export const replaceRecruiterProfile = async (token, data) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.PROFILE, 'PUT', token, data);
        return response;
    } catch (error) {
        console.error('Error in replaceRecruiterProfile:', error);
        throw error;
    }
};

/**
 * Xóa hồ sơ nhà tuyển dụng
 * @param {string} token - JWT token
 * @returns {Promise<void>}
 */
export const deleteRecruiterProfile = async (token) => {
    try {
        await apiRequest(ENDPOINTS.RECRUITER.PROFILE, 'DELETE', token);
    } catch (error) {
        console.error('Error in deleteRecruiterProfile:', error);
        throw error;
    }
};

/**
 * Tải lên logo công ty
 * @param {string} token - JWT token
 * @param {FormData} formData - Form data chứa file logo
 * @returns {Promise<Object>} Thông tin logo đã tải lên
 */
export const uploadCompanyLogo = async (token, formData) => {
    try {
        const response = await apiRequest(
            ENDPOINTS.RECRUITER.UPLOAD_LOGO,
            'POST',
            token,
            formData,
            true // isFormData flag
        );
        
        if (response && response.company_logo) {
            return {
                company_logo: response.company_logo
            };
        }
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Error uploading logo:', error);
        throw error;
    }
};

/**
 * Lấy danh sách tin tuyển dụng của nhà tuyển dụng
 * @param {string} token - JWT token
 * @param {string} userId - ID của nhà tuyển dụng
 * @param {Object} params - Các tham số lọc
 * @returns {Promise<Array>} Danh sách tin tuyển dụng
 */
export const getRecruiterJobs = async (token, userId, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.RECRUITER.JOBS(userId)}${queryString ? `?${queryString}` : ''}`;
        const response = await apiRequest(endpoint, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getRecruiterJobs:', error);
        throw error;
    }
};

/**
 * Gửi tin tuyển dụng để duyệt
 * @param {string} token - JWT token
 * @param {string} slug - Slug của tin tuyển dụng
 * @returns {Promise<Object>} Kết quả gửi duyệt
 */
export const submitJobForApproval = async (token, slug) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.JOB_SUBMIT_APPROVAL(slug), 'POST', token);
        return response;
    } catch (error) {
        console.error('Error in submitJobForApproval:', error);
        throw error;
    }
};

/**
 * Lấy danh sách đơn ứng tuyển cho một tin tuyển dụng
 * @param {string} token - JWT token
 * @param {string} slug - Slug của tin tuyển dụng
 * @returns {Promise<Array>} Danh sách đơn ứng tuyển
 */
export const getJobApplications = async (token, slug) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.JOB_APPLICATIONS(slug), 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getJobApplications:', error);
        throw error;
    }
};

/**
 * Lấy danh sách đơn ứng tuyển cho một tin tuyển dụng cụ thể
 * @param {string} token - JWT token
 * @param {string} jobPostingId - ID của tin tuyển dụng
 * @returns {Promise<Array>} Danh sách đơn ứng tuyển
 */
export const getRecruiterApplications = async (token, jobPostingId) => {
    try {
        const params = new URLSearchParams({ job_posting: jobPostingId }).toString();
        const response = await apiRequest(`${ENDPOINTS.RECRUITER.APPLICATIONS}?${params}`, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getRecruiterApplications:', error);
        throw error;
    }
};

/**
 * Từ chối đơn ứng tuyển
 * @param {string} token - JWT token
 * @param {string} applicationId - ID của đơn ứng tuyển
 * @returns {Promise<Object>} Kết quả từ chối
 */
export const rejectApplication = async (token, applicationId) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.APPLICATION_REJECT(applicationId), 'POST', token);
        return response;
    } catch (error) {
        console.error('Error in rejectApplication:', error);
        throw error;
    }
};

/**
 * Tạo lịch phỏng vấn mới
 * @param {string} token - JWT token
 * @param {Object} interviewData - Dữ liệu phỏng vấn
 * @returns {Promise<Object>} Thông tin phỏng vấn đã tạo
 */
export const createInterview = async (token, interviewData) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.INTERVIEWS, 'POST', token, interviewData);
        return response;
    } catch (error) {
        console.error('Error in createInterview:', error);
        throw error;
    }
};

/**
 * Hủy lịch phỏng vấn
 * @param {string} token - JWT token
 * @param {string} interviewId - ID của phỏng vấn
 * @returns {Promise<Object>} Kết quả hủy
 */
export const cancelInterview = async (token, interviewId) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.INTERVIEW_CANCEL(interviewId), 'POST', token);
        return response;
    } catch (error) {
        console.error('Error in cancelInterview:', error);
        throw error;
    }
};

/**
 * Đánh dấu phỏng vấn đã hoàn thành
 * @param {string} token - JWT token
 * @param {string} interviewId - ID của phỏng vấn
 * @returns {Promise<Object>} Kết quả hoàn thành
 */
export const completeInterview = async (token, interviewId) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.INTERVIEW_COMPLETE(interviewId), 'POST', token);
        return response;
    } catch (error) {
        console.error('Error in completeInterview:', error);
        throw error;
    }
};

/**
 * Lấy danh sách phỏng vấn
 * @param {string} token - JWT token
 * @param {Object} params - Các tham số lọc
 * @returns {Promise<Array>} Danh sách phỏng vấn
 */
export const getInterviews = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.RECRUITER.INTERVIEWS}${queryString ? `?${queryString}` : ''}`;
        const response = await apiRequest(endpoint, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getInterviews:', error);
        throw error;
    }
};

/**
 * Lấy thống kê cơ bản về tin tuyển dụng
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Thống kê cơ bản
 */
export const getRecruiterStats = async (token) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.STATS, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getRecruiterStats:', error);
        throw error;
    }
};

/**
 * Lấy thống kê hiệu suất tin tuyển dụng
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Thống kê hiệu suất
 */
export const getJobPerformance = async (token) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.JOB_PERFORMANCE, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getJobPerformance:', error);
        throw error;
    }
};

/**
 * Lấy thống kê trạng thái ứng viên
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Thống kê trạng thái ứng viên
 */
export const getApplicantStatus = async (token) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.APPLICANT_STATUS, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getApplicantStatus:', error);
        throw error;
    }
};

/**
 * Lấy nhật ký hoạt động
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Nhật ký hoạt động
 */
export const getActivityLog = async (token) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.ACTIVITY_LOG, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getActivityLog:', error);
        throw error;
    }
};

/**
 * Lấy thống kê tin tuyển dụng
 * @param {string} token - JWT token
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Object>} Thống kê tin tuyển dụng
 */
export const getJobStatistics = async (token, userId) => {
    try {
        const response = await apiRequest(ENDPOINTS.RECRUITER.JOB_STATISTICS(userId), 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getJobStatistics:', error);
        throw error;
    }
};