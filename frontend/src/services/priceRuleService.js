import axiosInstance from '../axiosConfig/axiosConfig';

const priceRuleService = {
  // Get all price rules with filters
  getAllPriceRules: async (page = 0, size = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...filters
      });
      const response = await axiosInstance.get(`/price-rules?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price rules:', error);
      throw error;
    }
  },

  // Get price rule by ID
  getPriceRuleById: async (id) => {
    try {
      const response = await axiosInstance.get(`/price-rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price rule:', error);
      throw error;
    }
  },

  // Create new price rule
  createPriceRule: async (priceRuleData) => {
    try {
      const response = await axiosInstance.post('/price-rules', priceRuleData);
      return response.data;
    } catch (error) {
      console.error('Error creating price rule:', error);
      throw error;
    }
  },

  // Update price rule
  updatePriceRule: async (id, priceRuleData) => {
    try {
      const response = await axiosInstance.put(`/price-rules/${id}`, priceRuleData);
      return response.data;
    } catch (error) {
      console.error('Error updating price rule:', error);
      throw error;
    }
  },

  // Delete price rule
  deletePriceRule: async (id) => {
    try {
      const response = await axiosInstance.delete(`/price-rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting price rule:', error);
      throw error;
    }
  }
};

export default priceRuleService;
