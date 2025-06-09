// RecruitmentFrontend/src/api/admin.js

import { apiRequest } from './request';
import { ENDPOINTS } from './config';

/**
 * User Management APIs
 */

export const getUsers = async (token, params = {}) => {
    try {
        console.log('params', params);
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.USERS}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error in getUsers:', error);
        throw error;
    }
};

export const getUserDetail = async (token, userId) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.USER_DETAIL(userId), 'GET', token);
    } catch (error) {
        console.error('Error in getUserDetail:', error);
        throw error;
    }
};

export const updateUser = async (token, userId, userData) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.USER_DETAIL(userId), 'PUT', token, userData);
    } catch (error) {
        console.error('Error in updateUser:', error);
        throw error;
    }
};

export const deleteUser = async (token, userId) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.USER_DETAIL(userId), 'DELETE', token);
    } catch (error) {
        console.error('Error in deleteUser:', error);
        throw error;
    }
};

/**
 * Role Management APIs
 */

export const getPendingRoles = async (token) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.PENDING_ROLES, 'GET', token);
    } catch (error) {
        console.error('Error in getPendingRoles:', error);
        throw error;
    }
};

export const approveRole = async (token, roleIds) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.APPROVE_ROLE, 'POST', token, { role_ids: roleIds });
    } catch (error) {
        console.error('Error in approveRole:', error);
        throw error;
    }
};

export const assignAdmin = async (token, userId) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.ASSIGN_ADMIN, 'POST', token, { user_id: userId });
    } catch (error) {
        console.error('Error in assignAdmin:', error);
        throw error;
    }
};

/**
 * Job Management APIs
 */

export const getJobDetail = async (slug, token = null) => {
    return apiRequest(ENDPOINTS.JOB_DETAIL(slug), 'GET', token);
  };

export const getPendingJobs = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.PENDING_JOBS}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error in getPendingJobs:', error);
        throw error;
    }
};


export const approveJob = async (token, jobId) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.APPROVE_JOB(jobId), 'POST', token);
    } catch (error) {
        console.error('Error in approveJob:', error);
        throw error;
    }
};

export const rejectJob = async (token, jobId, reason) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.REJECT_JOB(jobId), 'POST', token, { reason });
    } catch (error) {
        console.error('Error in rejectJob:', error);
        throw error;
    }
};

/**
 * Skills Management APIs
 */

/**
 * Skills Management APIs
 */

export const getSkills = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.SKILLS}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error in getSkills:', error);
        throw error;
    }
};

export const getSkillDetail = async (token, skillId) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.SKILL_DETAIL(skillId), 'GET', token);
    } catch (error) {
        console.error('Error in getSkillDetail:', error);
        throw error;
    }
};

export const createSkill = async (token, skillData) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.SKILLS, 'POST', token, skillData);
    } catch (error) {
        console.error('Error in createSkill:', error);
        throw error;
    }
};

export const updateSkill = async (token, skillId, skillData) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.SKILL_DETAIL(skillId), 'PUT', token, skillData);
    } catch (error) {
        console.error('Error in updateSkill:', error);
        throw error;
    }
};

export const deleteSkill = async (token, skillId) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.SKILL_DETAIL(skillId), 'DELETE', token);
    } catch (error) {
        console.error('Error in deleteSkill:', error);
        throw error;
    }
};

/**
 * Statistics APIs - Chỉ giữ lại các báo cáo hệ thống
 */

// Tổng quan số user, tin tuyển dụng, ứng tuyển
export const getSystemSummary = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.STATISTICS.SYSTEM_SUMMARY}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error fetching system summary:', error);
        throw error;
    }
};

// Xu hướng tuyển dụng theo thời gian
export const getSystemTrends = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.STATISTICS.SYSTEM_TRENDS}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error fetching system trends:', error);
        throw error;
    }
};

// Thống kê hiệu quả các thông báo
export const getNotificationStats = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.STATISTICS.NOTIFICATION_STATS}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        throw error;
    }
};

// Tạo báo cáo tùy chỉnh theo tham số input
export const generateCustomReport = async (token, reportParams) => {
    try {
        return await apiRequest(ENDPOINTS.ADMIN.STATISTICS.GENERATE_REPORT, 'POST', token, reportParams);
    } catch (error) {
        console.error('Error generating custom report:', error);
        throw error;
    }
};

// Xuất báo cáo ra file Excel hoặc PDF
export const exportReport = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.STATISTICS.EXPORT_REPORT}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error exporting report:', error);
        throw error;
    }
};

// Lấy các chỉ số KPI tùy chỉnh
export const getMetrics = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.STATISTICS.METRICS}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        throw error;
    }
};

/**
 * Activity Logs APIs
 */

export const getActivityLogs = async (token, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${ENDPOINTS.ADMIN.ACTIVITY_LOGS}${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint, 'GET', token);
    } catch (error) {
        console.error('Error in getActivityLogs:', error);
        throw error;
    }
};

