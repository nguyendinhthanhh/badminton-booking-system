import axiosInstance from '../axiosConfig/axiosConfig';

const courtPriceService = {
  getAllPrices: async () => {
    const response = await axiosInstance.get('/court-prices');
    return response.data;
  },

  createPrice: async (priceData) => {
    const response = await axiosInstance.post('/court-prices', priceData);
    return response.data;
  },

  updatePrice: async (id, priceData) => {
    const response = await axiosInstance.put(`/court-prices/${id}`, priceData);
    return response.data;
  },

  deletePrice: async (id) => {
    const response = await axiosInstance.delete(`/court-prices/${id}`);
    return response.data;
  },

  getPriceById: async (id) => {
    const response = await axiosInstance.get(`/court-prices/${id}`);
    return response.data;
  },

  getPricesByCourtId: async (courtId) => {
    const response = await axiosInstance.get(`/court-prices/court/${courtId}`);
    return response.data;
  },

  getPricesByCourtIdAndDayType: async (courtId, dayType) => {
    const response = await axiosInstance.get(`/court-prices/court/${courtId}/day-type/${dayType}`);
    return response.data;
  },

  calculatePrice: async (courtId, date, time) => {
    const response = await axiosInstance.get('/court-prices/calculate', {
      params: { courtId, date, time }
    });
    return response.data;
  },

  createDefaultPrices: async (courtId) => {
    const response = await axiosInstance.post(`/court-prices/court/${courtId}/init-default`);
    return response.data;
  }
};

export default courtPriceService;
