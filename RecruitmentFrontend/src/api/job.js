import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * Lấy danh sách tin tuyển dụng
 * @param {object} params - Các tham số tìm kiếm và lọc
 * @param {string} params.search - Từ khóa tìm kiếm
 * @param {string} params.ordering - Sắp xếp (views_count, -created_at)
 * @param {number} params.limit - Giới hạn số lượng
 * @param {number} params.offset - Vị trí bắt đầu
 * @returns {Promise<object>} Danh sách tin tuyển dụng
 */
export const getJobs = async (params = {}) => {
  return apiRequest(ENDPOINTS.JOBS, 'GET', null, null, params);
};

/**
 * Lấy chi tiết tin tuyển dụng
 * @param {string} slug - Slug của tin tuyển dụng
 * @returns {Promise<object>} Chi tiết tin tuyển dụng
 */
export const getJobDetail = async (slug) => {
  return apiRequest(ENDPOINTS.JOB_DETAIL(slug), 'GET');
};

/**
 * Lấy danh sách tin tuyển dụng nổi bật
 * @returns {Promise<object>} Danh sách tin tuyển dụng nổi bật
 */
export const getFeaturedJobs = async () => {
  return getJobs({
    ordering: '-views_count,-created_at',
    limit: 10
  });
};

/**
 * Lấy danh sách tin tuyển dụng phổ biến
 * @returns {Promise<object>} Danh sách tin tuyển dụng phổ biến
 */
export const getPopularJobs = async () => {
  return getJobs({
    ordering: '-views_count',
    limit: 20
  });
};

/**
 * Lấy danh sách tin tuyển dụng của nhà tuyển dụng
 * @param {string} token - JWT access token
 * @param {string} userId - ID của người dùng
 * @param {object} params - Các tham số tìm kiếm và phân trang (optional)
 * @returns {Promise<Object>} Danh sách tin tuyển dụng với phân trang
 */
export const getRecruiterJobs = async (token, userId, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/recruiters/${userId}/jobs/${queryString ? `?${queryString}` : ''}`;
        const response = await apiRequest(endpoint, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getRecruiterJobs:', error);
        throw error;
    }
};

/**
 * Tạo tin tuyển dụng mới
 * @param {string} token - JWT access token
 * @param {Object} jobData - Dữ liệu tin tuyển dụng
 * @returns {Promise<Object>} Tin tuyển dụng đã tạo
 */
export const createJob = async (token, jobData) => {
    try {
        const response = await apiRequest('/jobs/', 'POST', token, jobData);
        return response;
    } catch (error) {
        console.error('Error in createJob:', error);
        throw error;
    }
};

/**
 * Cập nhật tin tuyển dụng
 * @param {string} token - JWT access token
 * @param {string} slug - Slug của tin tuyển dụng
 * @param {Object} jobData - Dữ liệu cần cập nhật
 * @returns {Promise<Object>} Tin tuyển dụng đã cập nhật
 */
export const updateJob = async (token, slug, jobData) => {
    try {
        console.log('Updating job:', { slug, jobData }); // Log để debug

        // Format lại dữ liệu trước khi gửi
        const formattedData = {
            title: jobData.title,
            description: jobData.description,
            requirements: jobData.requirements,
            location: jobData.location,
            salary_min: parseFloat(jobData.salary_min) || null,
            salary_max: parseFloat(jobData.salary_max) || null,
            job_type: jobData.job_type,
            expiration_date: jobData.expiration_date ? 
                new Date(jobData.expiration_date).toISOString().split('T')[0] : null
        };

        console.log('Formatted data:', formattedData); // Log data đã format

        const response = await apiRequest(
            `/jobs/${slug}/`,
            'PUT',
            token,
            formattedData
        );

        console.log('Update response:', response); // Log response
        return response;
    } catch (error) {
        console.error('Error details:', error.response || error); // Log chi tiết lỗi
        throw new Error(error.response?.data?.message || 'Không thể cập nhật tin tuyển dụng');
    }
};

/**
 * Xóa tin tuyển dụng
 * @param {string} token - JWT access token
 * @param {string} slug - Slug của tin tuyển dụng
 * @returns {Promise<void>}
 */
export const deleteJob = async (token, slug) => {
    try {
        await apiRequest(`/jobs/${slug}/`, 'DELETE', token);
    } catch (error) {
        console.error('Error in deleteJob:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái tin tuyển dụng
 * @param {string} token - JWT access token
 * @param {string} slug - Slug của tin tuyển dụng
 * @param {string} status - Trạng thái mới
 * @returns {Promise<Object>} Tin tuyển dụng đã cập nhật trạng thái
 */
export const updateJobStatus = async (token, slug, status) => {
    try {
        const response = await apiRequest(`/jobs/${slug}/status/`, 'PATCH', token, { status });
        return response;
    } catch (error) {
        console.error('Error in updateJobStatus:', error);
        throw error;
    }
};

/**
 * Gửi tin tuyển dụng để duyệt
 * @param {string} token - JWT access token
 * @param {string} slug - Slug của tin tuyển dụng
 * @returns {Promise<Object>} Tin tuyển dụng đã gửi duyệt
 */
export const submitJobForApproval = async (token, slug) => {
    try {
        const response = await apiRequest(`/jobs/${slug}/submit_for_approval/`, 'POST', token);
        return response;
    } catch (error) {
        console.error('Error in submitJobForApproval:', error);
        throw error;
    }
};

/**
 * Lấy danh sách ứng viên đã ứng tuyển vào tin
 * @param {string} token - JWT access token
 * @param {string} slug - Slug của tin tuyển dụng
 * @returns {Promise<Array>} Danh sách ứng viên
 */
export const getJobApplications = async (token, slug) => {
    try {
        const response = await apiRequest(`/jobs/${slug}/applications/`, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getJobApplications:', error);
        throw error;
    }
};

/**
 * Tìm kiếm tin tuyển dụng
 * @param {string} token - JWT access token
 * @param {Object} searchParams - Các tham số tìm kiếm
 * @returns {Promise<Object>} Kết quả tìm kiếm với phân trang
 */
export const searchJobs = async (token, searchParams = {}) => {
    try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await apiRequest(`/jobs/search/?${queryString}`, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in searchJobs:', error);
        throw error;
    }
};

/**
 * Lấy thống kê tin tuyển dụng
 * @param {string} token - JWT access token
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Object>} Thống kê tin tuyển dụng
 */
export const getJobStatistics = async (token, userId) => {
    try {
        const response = await apiRequest(`/recruiters/${userId}/jobs/statistics/`, 'GET', token);
        return response;
    } catch (error) {
        console.error('Error in getJobStatistics:', error);
        throw error;
    }
};