export const API_URL = 'http://192.168.1.26:8000';

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

    // Job Seeker Profile
    JOB_SEEKER_PROFILE: '/job-seeker-profiles/me/',
    JOB_SEEKER_PROFILE_CREATE: '/job-seeker-profiles/',
    JOB_SEEKER_PROFILE_UPDATE: (id) => `/job-seeker-profiles/${id}/`,

    // Jobs
    JOBS: '/jobs/',
    JOB_DETAIL: (slug) => `/jobs/${slug}/`,
    RECRUITER_JOBS: (userId) => `/recruiters/${userId}/jobs/`,
    JOB_STATUS: (slug) => `/jobs/${slug}/status/`,


    RECRUITER: {
        // Hồ sơ nhà tuyển dụng
        PROFILE: '/recruiter-profile/',
        UPLOAD_LOGO: '/recruiter-profile-upload-logo/',
        PROFILE_DETAIL: (id) => `/recruiters/${id}/`,
        
        // Quản lý tin tuyển dụng
        JOBS: (userId) => `/recruiters/${userId}/jobs/`,
        JOB_SUBMIT_APPROVAL: (slug) => `/jobs/${slug}/submit_for_approval/`,
        JOB_APPLICATIONS: (slug) => `/jobs/${slug}/applications/`,
        JOB_STATISTICS: (userId) => `/recruiters/${userId}/jobs/statistics/`,
        
        // Quản lý đơn ứng tuyển
        APPLICATIONS: '/applications/recruiter_applications/',
        APPLICATION_REJECT: (id) => `/applications/${id}/reject/`,
        APPLICATION_OFFER: (id) => `/applications/${id}/offer/`,
        
        // Quản lý phỏng vấn
        INTERVIEWS: '/interviews/',
        INTERVIEW_CANCEL: (id) => `/interviews/${id}/cancel/`,
        INTERVIEW_COMPLETE: (id) => `/interviews/${id}/complete/`,
        
        // Báo cáo và thống kê
        STATS: '/recruiter/stats/',
        JOB_PERFORMANCE: '/recruiter/job-performance/',
        APPLICANT_STATUS: '/recruiter/applicant-status/',
        ACTIVITY_LOG: '/recruiter/activity-log/'
    },

    ADMIN: {
        // Users Management
        USERS: '/api/admin/users/',
        USER_DETAIL: (id) => `/api/admin/users/${id}/`,
        PENDING_ROLES: '/api/admin/user-roles/pending/',
        APPROVE_ROLE: '/api/admin/user-roles/approve/',
        REJECT_ROLE: '/api/admin/user-roles/reject/',
        ASSIGN_ADMIN: '/api/admin/user-roles/assign_admin/',

        // Jobs Management
        PENDING_JOBS: '/api/admin/jobs/pending/',
        APPROVE_JOB: (id) => `/api/admin/jobs/${id}/approve/`,
        REJECT_JOB: (id) => `/api/admin/jobs/${id}/reject/`,

        // Skills Management
        SKILLS: '/skills/',
        SKILL_DETAIL: (id) => `/skills/${id}/`,

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