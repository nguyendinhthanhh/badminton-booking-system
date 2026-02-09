import { useState } from 'react';

const PaymentModal = ({ isOpen, booking, onClose, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi onSuccess với paymentMethod
      // Parent component sẽ tạo booking và thanh toán
      await onSuccess(selectedMethod);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Lỗi khi thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'CASH', label: 'Tiền mặt', icon: 'payments' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản', icon: 'account_balance' },
    { value: 'MOMO', label: 'MoMo', icon: 'phone_android' },
    { value: 'VNPAY', label: 'VNPay', icon: 'credit_card' }
  ];

  // Calculate remaining amount
  const remainingAmount = booking.totalPrice - booking.depositAmount;

  // Calculate check-in deadline (startTime + 20 minutes)
  const calculateCheckInDeadline = () => {
    if (!booking.playDate || !booking.startTime) return '';
    const [hours, minutes] = booking.startTime.split(':');
    const deadline = new Date(booking.playDate);
    deadline.setHours(parseInt(hours), parseInt(minutes) + 20, 0, 0);
    return deadline;
  };

  const checkInDeadline = calculateCheckInDeadline();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Thanh toán đặt sân
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Booking Info */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Ngày chơi:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(booking.playDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Giờ chơi:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Tổng tiền:</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
              
              <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <span className="text-purple-700 dark:text-purple-300 font-semibold">
                  Cần thanh toán ngay (1/3):
                </span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(booking.depositAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Thanh toán khi check-in:
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 flex-shrink-0">
                  warning
                </span>
                <div className="space-y-2">
                  <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                    Lưu ý quan trọng:
                  </p>
                  <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                    <li>• Vui lòng check-in trước <strong>{formatDateTime(checkInDeadline)}</strong></li>
                    <li>• Nếu quá 20 phút chưa check-in, đặt sân sẽ <strong>tự động bị hủy</strong></li>
                    <li>• Tiền cọc có thể không được hoàn lại nếu không check-in đúng giờ</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Chọn phương thức thanh toán:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setSelectedMethod(method.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedMethod === method.value
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-xl ${
                      selectedMethod === method.value
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-slate-400'
                    }`}>
                      {method.icon}
                    </span>
                    <span className={`text-sm font-medium ${
                      selectedMethod === method.value
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">payment</span>
                  Thanh toán {formatCurrency(booking.depositAmount)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
