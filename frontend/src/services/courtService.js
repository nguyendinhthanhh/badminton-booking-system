import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const courtService = {
  // Lấy tất cả sân với phân trang
  getAllCourts: async (page = 0, size = 20) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courts/all`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courts:', error);
      throw error;
    }
  },

  // Lấy chi tiết một sân
  getCourtById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courts/findById/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching court details:', error);
      throw error;
    }
  },

  // Tạo mới sân
  createCourt: async (courtData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courts/create`, courtData);
      return response.data;
    } catch (error) {
      console.error('Error creating court:', error);
      throw error;
    }
  },

  // Cập nhật sân
  updateCourt: async (id, courtData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/courts/updateById/${id}`, courtData);
      return response.data;
    } catch (error) {
      console.error('Error updating court:', error);
      throw error;
    }
  },

  // Xóa sân
  deleteCourt: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/courts/deleteById/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting court:', error);
      throw error;
    }
  }
};

export default courtService;
