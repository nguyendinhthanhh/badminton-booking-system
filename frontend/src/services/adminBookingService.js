import axiosInstance from '../axiosConfig/axiosConfig';

export const adminBookingService = {
  getAllBookings: async (filters = {}) => {
    try {
      const params = {};

      if (filters.courtId) params.courtId = filters.courtId;
      if (filters.status) params.status = filters.status;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.page !== undefined) params.page = filters.page;
      if (filters.size !== undefined) params.size = filters.size;

      const response = await axiosInstance.get('/admin/bookings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      console.log(`Updating booking ${bookingId} to status ${status}`);
      // Use PATCH method with query param
      const response = await axiosInstance.patch(`/bookings/${bookingId}/status`, null, {
        params: { status }
      });
      console.log('Update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      console.error('Request URL:', `/bookings/${bookingId}/status?status=${status}`);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error;
    }
  },

  updatePaymentStatus: async (bookingId, paymentStatus) => {
    try {
      const response = await axiosInstance.patch(`/admin/bookings/${bookingId}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  extendBooking: async (bookingId, extensionMinutes, newEndTime) => {
    try {
      // Try without /admin prefix first (based on your API doc)
      const response = await axiosInstance.post(`/bookings/${bookingId}/extend`, {
        extensionMinutes,
        newEndTime: {
          hour: newEndTime.hour,
          minute: newEndTime.minute,
          second: 0,
          nano: 0
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error extending booking:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await axiosInstance.put(`/api/schedule/admin/booking/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  checkIn: async (bookingId) => {
    try {
      console.log('🔵 Checking in booking:', bookingId);
      const response = await axiosInstance.post(`/bookings/${bookingId}/check-in`);
      console.log('✅ Check-in successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking in booking:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  completeBooking: async (bookingId, actualEndTime) => {
    try {
      const response = await axiosInstance.post(`/bookings/${bookingId}/complete`, null, {
        params: { actualEndTime }
      });
      return response.data;
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  },

  getBookingById: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking #${bookingId}:`, error);
      throw error;
    }
  },

  releaseEarly: async (bookingId) => {
    try {
      const response = await axiosInstance.post(`/bookings/${bookingId}/release-early`);
      return response.data;
    } catch (error) {
      console.error('Error releasing booking early:', error);
      throw error;
    }
  },

  createWalkInBooking: async (bookingData) => {
    try {
      const response = await axiosInstance.post('/admin/bookings/walk-in', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating walk-in booking:', error);
      throw error;
    }
  },

  getAllCourts: async (page = 0, size = 20) => {
    try {
      const response = await axiosInstance.get('/courts/all', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courts:', error);
      throw error;
    }
  },

  getUsers: async (page = 0, size = 20, keyword = '') => {
    try {
      const params = { page, size, sortBy: 'id', sortDir: 'asc' };
      if (keyword) params.keyword = keyword;
      const response = await axiosInstance.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  calculatePrice: async (params) => {
    try {
      const response = await axiosInstance.get('/bookings/calculate-price', { params });
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  },

  approveCancellation: async (bookingId) => {
    try {
      const response = await axiosInstance.post(`/bookings/${bookingId}/cancellation/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving cancellation:', error);
      throw error;
    }
  },

  rejectCancellation: async (bookingId) => {
    try {
      const response = await axiosInstance.post(`/bookings/${bookingId}/cancellation/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting cancellation:', error);
      throw error;
    }
  }
};

export default adminBookingService;
