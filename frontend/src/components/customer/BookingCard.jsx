import React from 'react';
import { Calendar, Clock, MapPin, CreditCard, AlertCircle, XCircle } from 'lucide-react';
import CheckInCountdown from './CheckInCountdown';

const BookingCard = ({ booking, onCancel, onCheckIn }) => {
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      PLAYING: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLATION_REQUESTED: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800',
      UNPAID: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatTimeObject = (time) => {
    if (!time) return '';
    if (typeof time === 'string') return time.substring(0, 5);
    if (typeof time === 'object' && time.hour !== undefined) {
      return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
    }
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateWithTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString.replace(' ', 'T')); // Handle "YYYY-MM-DD HH:mm:ss" format
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{booking.courtName}</h3>
            <p className="text-blue-100 text-sm mt-1">
              Loại sân: {booking.courtType === 'SINGLE' ? 'Đơn' : 'Đôi'}
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)} bg-white`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Check-in Countdown */}
        {booking.checkInDeadline && (
          <div className="mt-3">
            <CheckInCountdown
              checkInDeadline={booking.checkInDeadline}
              status={booking.status}
            />
          </div>
        )}

        {/* Deposit Info */}
        {booking.depositRequired && booking.depositAmount && (
          <div className="mt-3 bg-white/10 rounded-lg p-2 text-xs">
            <div className="flex justify-between">
              <span>Đã cọc:</span>
              <span className="font-semibold">{formatCurrency(booking.depositPaid || 0)}</span>
            </div>
            {booking.remainingAmount > 0 && (
              <div className="flex justify-between mt-1">
                <span>Còn lại:</span>
                <span className="font-semibold">{formatCurrency(booking.remainingAmount)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Date and Time */}
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Ngày chơi</p>
            <p className="font-semibold text-gray-900">{formatDate(booking.playDate)}</p>
          </div>
        </div>

        {/* Detailed Time Breakdown */}
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Thời gian</p>
            <div className="flex flex-col gap-1">
              {/* Original Time */}
              <p className="font-semibold text-gray-900">
                {booking.startTime && booking.endTime
                  ? `${formatTimeObject(booking.startTime)} - ${booking.extensions && booking.extensions.length > 0
                    ? formatTimeObject(booking.extensions[0].originalEndTime)
                    : formatTimeObject(booking.actualEndTime || booking.endTime)
                  }`
                  : booking.openEnded
                    ? 'Chưa kết thúc'
                    : 'Chưa xác định'
                }
                <span className="text-sm text-gray-500 ml-2 font-normal">
                  ({
                    booking.extensions && booking.extensions.length > 0
                      ? (booking.durationMinutes || 0) - booking.extensions.reduce((sum, e) => sum + e.extensionMinutes, 0)
                      : booking.durationMinutes
                  } phút)
                </span>
              </p>

              {/* Extensions Detail */}
              {booking.extensions && booking.extensions.length > 0 && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100 mt-1">
                  {booking.extensions.map((ext, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>
                        + {ext.extensionMinutes}p ({formatTimeObject(ext.originalEndTime)} - {formatTimeObject(ext.extendedEndTime)})
                      </span>
                      <span className="font-bold">{formatCurrency(ext.extensionFee)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Breakdown Summary */}
        {(booking.priceBreakdown?.length > 0 || booking.overtimeMinutes > 0) && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm mt-2">
            {/* Original Price */}
            <div className="flex justify-between">
              <span className="text-gray-600">Giá gốc:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(
                  booking.totalPrice
                  - (booking.overtimeFee || 0)
                  - (booking.extensions ? booking.extensions.reduce((sum, e) => sum + e.extensionFee, 0) : 0)
                )}
              </span>
            </div>

            {/* Extension Total */}
            {booking.extensions && booking.extensions.length > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Phí gia hạn:</span>
                <span className="font-bold">{formatCurrency(booking.extensions.reduce((sum, e) => sum + e.extensionFee, 0))}</span>
              </div>
            )}

            {/* Overtime */}
            {booking.overtimeMinutes > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Phí quá giờ ({booking.overtimeMinutes}p):</span>
                <span className="font-bold">{formatCurrency(booking.overtimeFee)}</span>
              </div>
            )}
          </div>
        )}


        {/* Timestamp Summary */}
        <div className="border-t border-gray-100 pt-3 mt-3 grid grid-cols-1 gap-2">
          {booking.createdAt && (
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Ngày đặt:</span>
              <span>{formatDateWithTime(booking.createdAt)}</span>
            </div>
          )}
          {booking.confirmedAt && (
            <div className="flex justify-between text-[10px] text-blue-500 font-medium">
              <span>Xác nhận lúc:</span>
              <span>{formatDateWithTime(booking.confirmedAt)}</span>
            </div>
          )}
          {booking.checkedInAt && (
            <div className="flex justify-between text-[10px] text-purple-500 font-medium">
              <span>Check-in lúc:</span>
              <span>{formatDateWithTime(booking.checkedInAt)}</span>
            </div>
          )}
          {booking.completedAt && (
            <div className="flex justify-between text-[10px] text-green-500 font-medium">
              <span>Hoàn thành lúc:</span>
              <span>{formatDateWithTime(booking.completedAt)}</span>
            </div>
          )}
          {booking.cancelledAt && (
            <div className="flex flex-col text-[10px] text-red-500 font-medium border-l-2 border-red-200 pl-2">
              <div className="flex justify-between">
                <span>Đã hủy lúc:</span>
                <span>{formatDateWithTime(booking.cancelledAt)}</span>
              </div>
              {booking.cancelledBy && (
                <div className="flex justify-between mt-0.5">
                  <span>Người hủy:</span>
                  <span>{booking.cancelledBy}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Trạng thái thanh toán</p>
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Tổng tiền</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(booking.totalPrice)}
            </p>
          </div>
        </div>

        {/* Check-in & Payment Button (remaining 2/3 via VNPay) */}
        {booking.status === 'CONFIRMED' && booking.remainingAmount > 0 && onCheckIn && (
          <button
            onClick={() => onCheckIn(booking)}
            className="w-full mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Check-in & thanh toán 2/3 còn lại
          </button>
        )}

        {/* Cancel Button */}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <button
            onClick={() => onCancel(booking)}
            className={`w-full mt-3 px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${booking.status === 'CONFIRMED'
              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
          >
            {booking.status === 'CONFIRMED' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Yêu cầu hủy
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Hủy đặt sân
              </>
            )}
          </button>
        )}

        {booking.status === 'CANCELLATION_REQUESTED' && (
          <div className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
            <Clock className="w-4 h-4" />
            Đang chờ hủy
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
