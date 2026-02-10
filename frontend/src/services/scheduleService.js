import axios from '../axiosConfig/axiosConfig';

// Helper: format Date to YYYY-MM-DD using LOCAL timezone (avoids UTC shift)
const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const scheduleService = {
  // Timeline APIs
  getTimeline: async (date) => {
    try {
      const formattedDate = formatLocalDate(date);
      const response = await axios.get(`/schedule/admin/timeline?date=${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  },

  getTimelineRange: async (startDate, endDate) => {
    try {
      const formattedStart = formatLocalDate(startDate);
      const formattedEnd = formatLocalDate(endDate);
      const response = await axios.get(`/schedule/admin/timeline/range?startDate=${formattedStart}&endDate=${formattedEnd}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching timeline range:', error);
      throw error;
    }
  },

  getCourtTimeline: async (courtId, date) => {
    try {
      const formattedDate = formatLocalDate(date);
      const response = await axios.get(`/schedule/admin/court/${courtId}/timeline?date=${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching court timeline:', error);
      throw error;
    }
  },

  // Statistics API
  getStatistics: async (date) => {
    try {
      const formattedDate = formatLocalDate(date);
      const response = await axios.get(`/schedule/admin/statistics?date=${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // Booking Detail API
  getBookingDetail: async (bookingId) => {
    try {
      const response = await axios.get(`/schedule/admin/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      throw error;
    }
  },

  // Booking Management APIs
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await axios.put(`/schedule/admin/booking/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await axios.post(`/schedule/admin/booking/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await axios.patch(`/schedule/admin/booking/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  updatePaymentStatus: async (bookingId, paymentStatus) => {
    try {
      const response = await axios.patch(`/schedule/admin/booking/${bookingId}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Public APIs for guests/customers
  getPublicScheduleTimeline: async (date) => {
    try {
      const response = await axios.get('/schedule/public/timeline', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching public schedule:', error);
      throw error;
    }
  },

  getPublicCourtTimeline: async (courtId, date) => {
    try {
      const response = await axios.get(`/schedule/public/court/${courtId}/timeline`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching public court timeline:', error);
      throw error;
    }
  }
};

export default scheduleService;
