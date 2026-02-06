import React from 'react';
import { Calendar, Clock, MapPin, CreditCard, AlertCircle, XCircle } from 'lucide-react';

const BookingCard = ({ booking, onCancel }) => {
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      PLAYING: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
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

        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-500">Thời gian</p>
            <p className="font-semibold text-gray-900">
              {booking.startTime} - {booking.actualEndTime || booking.endTime}
              <span className="text-sm text-gray-500 ml-2">
                ({booking.durationMinutes} phút)
              </span>
            </p>
          </div>
        </div>

        {/* Price Breakdown */}
        {booking.priceBreakdown && booking.priceBreakdown.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Chi tiết giá:</p>
            {booking.priceBreakdown.map((period, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {period.periodStart} - {period.periodEnd}
                  <span className="text-xs text-gray-500 ml-1">
                    ({period.dayType === 'WEEKDAY' ? 'Ngày thường' : 'Cuối tuần'})
                  </span>
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(period.subtotal)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Overtime */}
        {booking.overtimeMinutes > 0 && (
          <div className="flex items-start space-x-3 bg-orange-50 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-orange-700">
                Phụ phí thời gian: {booking.overtimeMinutes} phút
              </p>
              <p className="font-semibold text-orange-900">
                {formatCurrency(booking.overtimeFee)}
              </p>
            </div>
          </div>
        )}

        {/* Extensions */}
        {booking.extensions && booking.extensions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm font-semibold text-blue-700 mb-2">Gia hạn:</p>
            {booking.extensions.map((ext, index) => (
              <div key={index} className="text-sm text-blue-600">
                + {ext.extensionMinutes} phút ({formatCurrency(ext.extensionFee)})
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">{booking.notes}</p>
          </div>
        )}
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
        
        {/* Cancel Button */}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <button
            onClick={() => onCancel(booking)}
            className="w-full mt-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Hủy đặt sân
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
