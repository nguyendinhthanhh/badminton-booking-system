import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ConfirmStatusDialog = ({ booking, newStatus, onConfirm, onCancel, loading }) => {
  const getStatusInfo = (status) => {
    const info = {
      CONFIRMED: {
        title: 'Xác nhận booking',
        message: 'Bạn có chắc muốn xác nhận booking này?',
        icon: CheckCircle,
        color: 'blue'
      },
      PLAYING: {
        title: 'Bắt đầu chơi',
        message: 'Xác nhận khách hàng đã bắt đầu chơi?',
        icon: CheckCircle,
        color: 'purple'
      },
      COMPLETED: {
        title: 'Hoàn thành',
        message: 'Xác nhận booking đã hoàn thành?',
        icon: CheckCircle,
        color: 'green'
      },
      CANCELLED: {
        title: 'Hủy booking',
        message: 'Bạn có chắc muốn hủy booking này?',
        icon: XCircle,
        color: 'red'
      }
    };
    return info[status] || info.CONFIRMED;
  };

  const statusInfo = getStatusInfo(newStatus);
  const Icon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full bg-${statusInfo.color}-100 flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-6 h-6 text-${statusInfo.color}-600`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            {statusInfo.title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-4">
            {statusInfo.message}
          </p>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Booking:</span>
              <span className="font-semibold">#{booking.bookingId}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Sân:</span>
              <span className="font-semibold">{booking.courtName}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Khách hàng:</span>
              <span className="font-semibold">{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giờ:</span>
              <span className="font-semibold">{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>

          {/* Warning for cancel */}
          {newStatus === 'CANCELLED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-800">
                Hành động này không thể hoàn tác. Khách hàng sẽ được thông báo về việc hủy booking.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-${statusInfo.color}-600 text-white rounded-lg hover:bg-${statusInfo.color}-700 transition-colors font-medium disabled:opacity-50`}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStatusDialog;
