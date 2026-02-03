import axiosInstance from '../axiosConfig/axiosConfig';

const userService = {
  getAllUsers: async (page = 0, size = 10, filters = {}) => {
    try {
      const params = {
        page,
        size,
        sortBy: filters.sortBy || 'id',
        sortDir: filters.sortDir || 'asc'
      };

      // Add filters if they exist
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.username) params.username = filters.username;
      if (filters.fullName) params.fullName = filters.fullName;
      if (filters.email) params.email = filters.email;
      if (filters.phoneNumber) params.phoneNumber = filters.phoneNumber;
      if (filters.gender) params.gender = filters.gender;
      if (filters.roleName) params.roleName = filters.roleName;
      if (filters.dateOfBirthFrom) params.dateOfBirthFrom = filters.dateOfBirthFrom;
      if (filters.dateOfBirthTo) params.dateOfBirthTo = filters.dateOfBirthTo;
      if (filters.createdAtFrom) params.createdAtFrom = filters.createdAtFrom;
      if (filters.createdAtTo) params.createdAtTo = filters.createdAtTo;

      const response = await axiosInstance.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post('/users/logout');
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
};

export default userService;
