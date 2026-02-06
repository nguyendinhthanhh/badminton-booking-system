import axiosInstance from '../axiosConfig/axiosConfig';

const passwordService = {
  // Change password (for logged in users)
  changePassword: async (passwordData) => {
    const response = await axiosInstance.post('/api/password/change', passwordData);
    return response.data;
  },

  // Reset password (with token)
  resetPassword: async (resetData) => {
    const response = await axiosInstance.post('/api/password/reset', resetData);
    return response.data;
  }
};

export default passwordService;
