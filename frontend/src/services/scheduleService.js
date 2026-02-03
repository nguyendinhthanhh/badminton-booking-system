import axios from '../axiosConfig/axiosConfig';

const scheduleService = {
  getTimeline: async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const response = await axios.get(`/schedule/admin/timeline?date=${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  },

  getStatistics: async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const response = await axios.get(`/schedule/admin/statistics?date=${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  getBookingDetail: async (bookingId) => {
    try {
      const response = await axios.get(`/schedule/admin/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      throw error;
    }
  },

  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await axios.put(`/schedule/admin/booking/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }
};

export default scheduleService;
