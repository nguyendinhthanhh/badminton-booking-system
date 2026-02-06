import axios from '../axiosConfig/axiosConfig';

const timeSlotService = {
  getAllTimeSlots: async () => {
    try {
      const response = await axios.get('/time-slots');
      return response.data;
    } catch (error) {
      console.error('Error fetching all time slots:', error);
      throw error;
    }
  },

  getActiveTimeSlots: async () => {
    try {
      const response = await axios.get('/time-slots/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active time slots:', error);
      throw error;
    }
  },

  getTimeSlotById: async (id) => {
    try {
      const response = await axios.get(`/time-slots/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching time slot with ID ${id}:`, error);
      throw error;
    }
  },

  // Admin APIs
  createTimeSlot: async (timeSlotData) => {
    try {
      const response = await axios.post('/time-slots', timeSlotData);
      return response.data;
    } catch (error) {
      console.error('Error creating time slot:', error);
      throw error;
    }
  },

  updateTimeSlot: async (id, timeSlotData) => {
    try {
      const response = await axios.put(`/time-slots/${id}`, timeSlotData);
      return response.data;
    } catch (error) {
      console.error(`Error updating time slot ${id}:`, error);
      throw error;
    }
  },

  deleteTimeSlot: async (id) => {
    try {
      await axios.delete(`/time-slots/${id}`);
    } catch (error) {
      console.error(`Error deleting time slot ${id}:`, error);
      throw error;
    }
  }
};

export default timeSlotService;
