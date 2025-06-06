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
    ADMIN_APPROVE_RECRUITER: '/admin/user-roles/approve/',
    ADMIN_ASSIGN_ADMIN: '/admin/user-roles/assign-admin/',

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
};