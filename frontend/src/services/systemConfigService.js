import axiosInstance from '../axiosConfig/axiosConfig';

const systemConfigService = {
    getAllConfigs: async () => {
        try {
            const response = await axiosInstance.get('/admin/config');
            return response.data;
        } catch (error) {
            console.error('Error fetching system configs:', error);
            throw error;
        }
    },

    updateConfigs: async (configs) => {
        try {
            const response = await axiosInstance.post('/admin/config', configs);
            return response.data;
        } catch (error) {
            console.error('Error updating system configs:', error);
            throw error;
        }
    }
};

export default systemConfigService;
