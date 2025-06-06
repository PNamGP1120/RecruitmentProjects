export const API_URL = 'http://192.168.1.6:8000';

export const ENDPOINTS = {
    // Xac thuc, phan quyen
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    CURRENT_USER: '/auth/user_info/',
    UPDATE_USER: '/auth/update_user/',
    REGISTER_JOB_SEEKER: '/auth/register/job-seeker/',
    REGISTER_RECRUITER: '/auth/register/recruiter/',
    SWITCH_ROLE: '/auth/switch-role/',
    ROLES: '/roles/',

    // Admin
    ADMIN_APPROVE_RECRUITER: '/api/admin/user-roles/approve/',
    ADMIN_ASSIGN_ADMIN: '/api/admin/user-roles/assign-admin/',

    // // 📄 CV, hồ sơ
    // UPLOAD_CV: '/cv/upload/',
    // GET_CV_LIST: '/cv/',
    // DELETE_CV: (id) => `/cv/${id}/`,
    //
    // // 📢 Việc làm
    // JOB_LIST: '/jobs/',
    // JOB_DETAIL: (id) => `/jobs/${id}/`,
    // CREATE_JOB: '/jobs/create/',
    // APPLY_JOB: (id) => `/jobs/${id}/apply/`,
    //
    // // 📬 Ứng tuyển
    // MY_APPLICATIONS: '/applications/',
    // APPLICATION_DETAIL: (id) => `/applications/${id}/`,
    //
    // // 💬 Chat
    // MESSAGE_LIST: '/messages/',
    // SEND_MESSAGE: '/messages/send/',
    //
    // // 🔔 Thông báo
    // NOTIFICATIONS: '/notifications/',

    // 📄 Resume/CV
    RESUMES: '/resumes/',
    RESUME_DETAIL: (uuid) => `/resumes/${uuid}/`,
    AVATAR_UPLOAD: '/auth/avatar_upload/',
    SKILLS: '/skills/',

    // Jobs
    JOBS: '/jobs/',
    JOB_DETAIL: (id) => `/jobs/${id}/`,
    RECRUITER_JOBS: (userId) => `/recruiters/${userId}/jobs/`,
    JOB_STATUS: (id) => `/jobs/${id}/status/`,

    ADMIN: {
        // Users Management
        USERS: '/api/admin/users/',
        USER_DETAIL: (id) => `/api/admin/users/${id}/`,
        PENDING_ROLES: '/api/admin/user-roles/pending/',
        APPROVE_ROLE: '/api/admin/user-roles/approve/',
        REJECT_ROLE: '/api/admin/user-roles/reject/',
        ASSIGN_ADMIN: '/api/admin/user-roles/assign-admin/',

        // Jobs Management
        PENDING_JOBS: '/api/admin/jobs/pending/',
        APPROVE_JOB: (id) => `/api/admin/jobs/${id}/approve/`,
        REJECT_JOB: (id) => `/api/admin/jobs/${id}/reject/`,

        // Skills Management
        SKILLS: '/api/admin/skills/',
        SKILL_DETAIL: (id) => `/api/admin/skills/${id}/`,

        // Statistics
        STATISTICS: {

            
            // Các báo cáo hệ thống
            SYSTEM_SUMMARY: '/system/summary/',
            SYSTEM_TRENDS: '/system/trends/',
            NOTIFICATION_STATS: '/system/notifications/',
            
            // Báo cáo tùy chỉnh
            GENERATE_REPORT: '/generate/',
            EXPORT_REPORT: '/export/',
            METRICS: '/metrics/',
        },

        // Activity Logs
        ACTIVITY_LOGS: '/api/admin/activity-logs/',
    }

};