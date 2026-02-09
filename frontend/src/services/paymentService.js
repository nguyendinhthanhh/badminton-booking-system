import axiosClient from '../axiosConfig/axiosConfig';

const paymentService = {
  // Thanh toán deposit (1/3 tiền cọc)
  payDeposit: async (depositData) => {
    try {
      const response = await axiosClient.post('/payments/deposit', depositData);
      return response.data;
    } catch (error) {
      console.error('Error paying deposit:', error);
      throw error;
    }
  },

  // Thanh toán phần còn lại khi check-in
  payRemaining: async (bookingId, paymentMethod) => {
    try {
      const response = await axiosClient.post(`/payments/remaining/${bookingId}`, null, {
        params: { paymentMethod }
      });
      return response.data;
    } catch (error) {
      console.error('Error paying remaining:', error);
      throw error;
    }
  }
};

export default paymentService;
