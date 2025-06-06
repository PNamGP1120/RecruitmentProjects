import { apiRequest } from './request';

export const getRecruiterProfile = async (token) => {
    try {
        console.log('Fetching recruiter profile with token:', token);
        const response = await apiRequest('/recruiter-profile/', 'GET', token);
        console.log('Profile response:', response);
        return response;
    } catch (error) {
        console.error('Error in getRecruiterProfile:', error);
        throw error;
    }
};

export const updateRecruiterProfile = async (token, data) => {
    try {
        const response = await apiRequest('/recruiter-profile/', 'PATCH', token, data);
        return response;
    } catch (error) {
        console.error('Error in updateRecruiterProfile:', error);
        throw error;
    }
};

export const uploadCompanyLogo = async (token, formData) => {
    try {
        console.log('Uploading logo...'); // Debug log
        const response = await apiRequest(
            '/recruiter-profile-upload-logo/',  // Sửa lại endpoint cho đúng
            'POST',
            token,
            formData,
            true // isFormData flag
        );
        console.log('Upload logo response:', response);
        
        // API trả về format { company_logo: "url_image", message: "success_message" }
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