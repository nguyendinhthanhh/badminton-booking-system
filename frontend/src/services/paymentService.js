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

  // Tạo VNPay payment URL cho thanh toán deposit
  createVnPayDepositUrl: async (depositData) => {
    try {
      const response = await axiosClient.post('/payments/deposit/vnpay-url', depositData);
      return response.data;
    } catch (error) {
      console.error('Error creating VNPay payment URL:', error);
      throw error;
    }
  },

  // Xác nhận thanh toán VNPay sau khi redirect về frontend
  confirmVnPayPayment: async (vnpParams) => {
    try {
      const response = await axiosClient.post('/payments/vnpay/confirm', vnpParams);
      return response.data;
    } catch (error) {
      console.error('Error confirming VNPay payment:', error);
      throw error;
    }
  },

  // Tạo VNPay payment URL cho phần còn lại khi check-in
  createVnPayRemainingUrl: async (bookingId) => {
    try {
      const response = await axiosClient.post(`/payments/remaining/${bookingId}/vnpay-url`);
      return response.data;
    } catch (error) {
      console.error('Error creating VNPay remaining payment URL:', error);
      throw error;
    }
  },

  // Thanh toán phần còn lại khi check-in (non-VNPay methods)
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
