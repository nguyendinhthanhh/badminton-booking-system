import axiosInstance from '../axiosConfig/axiosConfig';

export const myBookingService = {
  getMyBookings: async (fromDate, toDate, status, paymentStatus) => {
    try {
      const params = {};
      
      // Chỉ thêm params nếu có giá trị
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (status && status !== 'ALL') params.status = status;
      if (paymentStatus && paymentStatus !== 'ALL') params.paymentStatus = paymentStatus;
      
      const response = await axiosInstance.get('/bookings/my-bookings', { params });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      throw error;
    }
  },

  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await axiosInstance.post(`/bookings/my-bookings/${bookingId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};
