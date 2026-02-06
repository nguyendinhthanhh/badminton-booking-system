import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const CancelBookingModal = ({ booking, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Lý do hủy phải có ít nhất 10 ký tự');
      return;
    }

    onConfirm(reason.trim());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const commonReasons = [
    'Bận việc đột xuất, không thể đến được',
    'Thay đổi kế hoạch',
    'Thời tiết không thuận lợi',
    'Có việc gia đình đột xuất',
    'Không đủ số lượng người chơi',
    'Đặt nhầm thời gian'
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hủy đặt sân</h2>
              <p className="text-xs text-gray-500">Booking #{booking.bookingId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Thông tin đặt sân</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sân:</span>
                <span className="font-medium text-gray-900">{booking.courtName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày:</span>
                <span className="font-medium text-gray-900">{formatDate(booking.playDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giờ:</span>
                <span className="font-medium text-gray-900">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-blue-600">{formatCurrency(booking.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Không thể hoàn tác sau khi hủy</li>
                  <li>Chính sách hoàn tiền theo quy định</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Quick Reasons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy
              </label>
              <div className="space-y-1.5">
                {commonReasons.map((commonReason, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setReason(commonReason)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                      reason === commonReason
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {commonReason}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoặc nhập lý do khác
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder="Nhập lý do hủy (tối thiểu 10 ký tự)..."
                rows={3}
                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/200 ký tự
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-xs text-red-800">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
