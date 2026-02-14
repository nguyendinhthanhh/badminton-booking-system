import axiosClient from '../axiosConfig/axiosConfig';

const bookingService = {
  // Tạo booking mới
  createBooking: async (bookingData) => {
    try {
      console.log('Creating booking:', bookingData);
      const response = await axiosClient.post('/bookings', bookingData);
      console.log('✅ Booking created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating booking:');
      console.error('Status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Request data:', bookingData);
      throw error;
    }
  },

  // Kiểm tra availability
  checkAvailability: async (courtId, playDate, startTime, endTime) => {
    try {
      const params = {
        courtId: parseInt(courtId),
        playDate,
        startTime,
        endTime
      };
      console.log('🔍 Checking availability:', params);
      console.log('📤 Full URL:', `/bookings/check-availability?courtId=${courtId}&playDate=${playDate}&startTime=${startTime}&endTime=${endTime}`);

      const response = await axiosClient.get('/bookings/check-availability', { params });
      console.log('✅ Availability response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking availability:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      console.error('Request params:', error.config?.params);
      throw error;
    }
  },

  // Tính giá
  calculatePrice: async (courtId, playDate, startTime, endTime) => {
    try {
      console.log('💰 Calculating price:', { courtId, playDate, startTime, endTime });
      const response = await axiosClient.get('/bookings/calculate-price', {
        params: { courtId, playDate, startTime, endTime }
      });
      console.log('✅ Price response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error calculating price:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy thông tin booking
  getBooking: async (bookingId) => {
    try {
      const response = await axiosClient.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  // Lấy bookings của user
  getUserBookings: async (userId, fromDate, toDate) => {
    try {
      const response = await axiosClient.get(`/bookings/user/${userId}`, {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Hủy booking
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await axiosClient.post(`/bookings/${bookingId}/cancel`, null, {
        params: { reason }
      });
      return response.data;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  },

  // Lấy available slots
  getAvailableSlots: async (courtId, date) => {
    try {
      const response = await axiosClient.get(`/bookings/court/${courtId}/available-slots`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  },

  // Lấy bookings của sân theo ngày
  getCourtBookings: async (courtId, date) => {
    try {
      const response = await axiosClient.get(`/bookings/court/${courtId}`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching court bookings:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái booking
  updateStatus: async (bookingId, status) => {
    try {
      const response = await axiosClient.patch(`/bookings/${bookingId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Gia hạn booking
  extendBooking: async (bookingId, extendData) => {
    try {
      const response = await axiosClient.post(`/bookings/${bookingId}/extend`, extendData);
      return response.data;
    } catch (error) {
      console.error('Error extending booking:', error);
      throw error;
    }
  },
  // User tự hủy/yêu cầu hủy booking
  cancelMyBooking: async (bookingId, reason) => {
    try {
      const response = await axiosClient.post(`/bookings/my-bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error canceling my booking:', error);
      throw error;
    }
  },

  // Admin duyệt hủy booking
  approveCancellation: async (bookingId) => {
    try {
      const response = await axiosClient.post(`/bookings/${bookingId}/cancellation/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving cancellation:', error);
      throw error;
    }
  },

  // Admin từ chối hủy booking
  rejectCancellation: async (bookingId) => {
    try {
      const response = await axiosClient.post(`/bookings/${bookingId}/cancellation/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting cancellation:', error);
      throw error;
    }
  }
};

export default bookingService;

