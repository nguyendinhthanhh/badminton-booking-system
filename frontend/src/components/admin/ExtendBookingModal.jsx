import React, { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';

const ExtendBookingModal = ({ booking, onClose, onConfirm, loading }) => {
  const [extensionMinutes, setExtensionMinutes] = useState(30);
  const [error, setError] = useState('');

  const calculateNewEndTime = (minutes) => {
    if (!booking?.endTime) return { hour: 0, minute: 0 };
    const [hours, mins] = booking.endTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return { hour: newHours, minute: newMins };
  };

  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (extensionMinutes < 15) {
      setError('Thời gian gia hạn tối thiểu 15 phút');
      return;
    }

    if (extensionMinutes > 180) {
      setError('Thời gian gia hạn tối đa 180 phút (3 giờ)');
      return;
    }

    const newEndTime = calculateNewEndTime(extensionMinutes);
    onConfirm(booking.bookingId, extensionMinutes, newEndTime);
  };

  const newEndTime = calculateNewEndTime(extensionMinutes);
  const quickOptions = [15, 30, 60, 90, 120];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <h2 className="text-lg font-bold">Gia hạn Booking</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Booking:</span>
              <span className="font-semibold text-gray-900">#{booking.bookingId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Sân:</span>
              <span className="font-semibold text-gray-900">{booking.courtName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Giờ hiện tại:</span>
              <span className="font-semibold text-gray-900">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giờ mới:</span>
              <span className="font-bold text-purple-600">
                {booking.startTime} - {formatTime(newEndTime.hour, newEndTime.minute)}
              </span>
            </div>
          </div>

          {/* Quick Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn nhanh thời gian gia hạn
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quickOptions.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setExtensionMinutes(mins);
                    setError('');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${extensionMinutes === mins
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {mins}p
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hoặc nhập số phút tùy chỉnh
            </label>
            <div className="relative">
              <input
                type="number"
                value={extensionMinutes}
                onChange={(e) => {
                  setExtensionMinutes(Number(e.target.value));
                  setError('');
                }}
                min={15}
                max={180}
                step={15}
                placeholder="VD: 45"
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-400 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">
                phút
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Tối thiểu 15 phút, tối đa 180 phút
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-semibold mb-1">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Phí gia hạn sẽ được tính theo giá hiện tại</li>
                <li>Kiểm tra sân có trống trong thời gian gia hạn</li>
              </ul>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận gia hạn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExtendBookingModal;
