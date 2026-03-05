import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing | success | failed
  const [message, setMessage] = useState('Đang xác nhận thanh toán VNPay...');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const vnpParams = {};
    for (const [key, value] of queryParams.entries()) {
      vnpParams[key] = value;
    }

    if (!vnpParams['vnp_TxnRef']) {
      setStatus('failed');
      setMessage('Không tìm thấy thông tin giao dịch VNPay.');
      return;
    }

    const confirmPayment = async () => {
      try {
        const booking = await paymentService.confirmVnPayPayment(vnpParams);
        setStatus('success');
        setMessage(`Thanh toán thành công cho booking #${booking.bookingId}. Đang chuyển đến lịch đặt sân của bạn...`);

        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      } catch (error) {
        console.error('VNPay confirmation error:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Xác nhận thanh toán VNPay thất bại. Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.';
        setStatus('failed');
        setMessage(errorMessage);
      }
    };

    confirmPayment();
  }, [location.search, navigate]);

  const isSuccess = status === 'success';
  const isProcessing = status === 'processing';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-4">
          {isProcessing && (
            <div className="mx-auto w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          )}
          {isSuccess && (
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
            </div>
          )}
          {!isProcessing && !isSuccess && (
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-red-600">error</span>
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold mb-2">
          {isProcessing && 'Đang xử lý thanh toán'}
          {isSuccess && 'Thanh toán thành công'}
          {!isProcessing && !isSuccess && 'Thanh toán thất bại'}
        </h1>

        <p className="text-gray-600 mb-6 text-sm">{message}</p>

        {!isProcessing && (
          <button
            onClick={() => navigate('/my-bookings')}
            className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm ${
              isSuccess
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Xem lịch đặt sân
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;

