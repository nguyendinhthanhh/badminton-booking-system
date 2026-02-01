import axiosClient from '../axiosConfig/axiosConfig';

const courtService = {
  // Lấy tất cả sân với phân trang
  getAllCourts: async (page = 0, size = 20) => {
    try {
      const response = await axiosClient.get('/courts/all', {
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
      const response = await axiosClient.get(`/courts/findById/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching court details:', error);
      throw error;
    }
  },

  // Tạo mới sân
  createCourt: async (courtData) => {
    try {
      const response = await axiosClient.post('/courts/create', courtData);
      return response.data;
    } catch (error) {
      console.error('Error creating court:', error);
      throw error;
    }
  },

  // Cập nhật sân
  updateCourt: async (id, courtData) => {
    try {
      const response = await axiosClient.put(`/courts/updateById/${id}`, courtData);
      return response.data;
    } catch (error) {
      console.error('Error updating court:', error);
      throw error;
    }
  },

  // Xóa sân
  deleteCourt: async (id) => {
    try {
      const response = await axiosClient.delete(`/courts/deleteById/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting court:', error);
      throw error;
    }
  }
};

export default courtService;
