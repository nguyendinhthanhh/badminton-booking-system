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
  },

  // Lấy chi tiết sân với giá và availability theo ngày
  getCourtDetailByDate: async (id, date) => {
    try {
      const response = await axiosClient.get(`/courts/${id}/detail`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching court detail by date:', error);
      throw error;
    }
  },

  // Lọc sân theo điều kiện
  filterCourts: async (filters = {}, page = 0, size = 20) => {
    try {
      // Build Params using URLSearchParams to handle arrays correctly for Spring Boot (types=A&types=B)
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);

      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        params.append('maxPrice', filters.maxPrice);
      }

      if (filters.types && Array.isArray(filters.types)) {
        filters.types.forEach(type => params.append('types', type));
      }

      // Default status to ACTIVE if not provided
      params.append('status', filters.status || 'ACTIVE');

      const response = await axiosClient.get('/courts/filter', { params });
      return response.data;
    } catch (error) {
      console.error('Error filtering courts:', error);
      throw error;
    }
  }
};

export default courtService;
