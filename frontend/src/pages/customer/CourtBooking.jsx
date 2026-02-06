import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import courtService from '../../services/courtService';
import scheduleService from '../../services/scheduleService';
import Toast from '../../components/common/Toast';

const CourtBooking = () => {
  const [courts, setCourts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleTimeline, setScheduleTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [selectedCourt, setSelectedCourt] = useState(null);

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchScheduleTimeline();
    }
  }, [selectedDate]);

  const fetchCourts = async () => {
    try {
      const response = await courtService.getAllCourts(0, 100);
      setCourts(response.content || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
      showToast('Lỗi khi tải danh sách sân', 'error');
    }
  };

  const fetchScheduleTimeline = async () => {
    setLoading(true);
    try {
      const timeline = await scheduleService.getPublicScheduleTimeline(selectedDate);
      setScheduleTimeline(timeline);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      showToast('Lỗi khi tải lịch sân', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'BOOKED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Trống';
      case 'BOOKED':
        return 'Đã đặt';
      case 'MAINTENANCE':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (time) => {
    return time?.substring(0, 5) || '';
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">


      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex mb-6">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-[#616e89] hover:text-primary dark:text-gray-400 dark:hover:text-white">
                <span className="material-symbols-outlined text-[20px] mr-2">home</span>
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">chevron_right</span>
                <span className="ml-1 text-sm font-medium text-[#111318] md:ml-2 dark:text-white">Đặt sân</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-4xl">sports_tennis</span>
            <h1 className="text-3xl font-bold text-[#111318] dark:text-white">Đặt sân cầu lông</h1>
          </div>
          <p className="text-[#616e89] dark:text-gray-400">
            Chọn sân và khung giờ phù hợp với bạn
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              <label className="text-sm font-medium text-[#111318] dark:text-white">
                Chọn ngày:
              </label>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <div className="flex items-center gap-2 text-sm text-[#616e89] dark:text-gray-400">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>
                {new Date(selectedDate).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Timeline */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : scheduleTimeline ? (
          <div className="space-y-6">
            {scheduleTimeline.courts && scheduleTimeline.courts.length > 0 ? (
              scheduleTimeline.courts.map((court) => (
                <div
                  key={court.courtId}
                  className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  {/* Court Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                          <span className="material-symbols-outlined text-primary text-3xl">sports_tennis</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-[#111318] dark:text-white mb-1">
                            {court.courtName}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-[#616e89] dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">category</span>
                              {court.courtType}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className={`size-2 rounded-full ${court.courtStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                                }`}></span>
                              {court.courtStatus === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCourt(selectedCourt === court.courtId ? null : court.courtId)}
                        className="text-primary hover:text-primary-hover transition-colors"
                      >
                        <span className="material-symbols-outlined text-[28px]">
                          {selectedCourt === court.courtId ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Time Slots */}
                  {(selectedCourt === court.courtId || selectedCourt === null) && (
                    <div className="p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {court.slots && court.slots.length > 0 ? (
                          court.slots.map((slot, index) => (
                            <div
                              key={index}
                              className={`relative p-4 rounded-lg border-2 transition-all ${getStatusColor(slot.status)} ${slot.status === 'AVAILABLE'
                                  ? 'hover:shadow-md hover:scale-105 cursor-pointer'
                                  : 'opacity-75 cursor-not-allowed'
                                }`}
                            >
                              <div className="flex flex-col items-center text-center">
                                <span className="material-symbols-outlined text-[24px] mb-2">
                                  {slot.status === 'AVAILABLE' ? 'check_circle' :
                                    slot.status === 'BOOKED' ? 'cancel' : 'build'}
                                </span>
                                <div className="font-bold text-sm mb-1">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </div>
                                <div className="text-xs font-medium mb-2">
                                  {getStatusText(slot.status)}
                                </div>
                                {slot.price && (
                                  <div className="text-xs font-semibold text-primary">
                                    {formatPrice(slot.price)}
                                  </div>
                                )}
                              </div>
                              {slot.status === 'AVAILABLE' && (
                                <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 rounded-lg transition-colors"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8 text-[#616e89] dark:text-gray-400">
                            Không có khung giờ nào
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-[80px] mb-4">
                  event_busy
                </span>
                <h3 className="text-xl font-semibold text-[#111318] dark:text-white mb-2">
                  Không có sân nào
                </h3>
                <p className="text-[#616e89] dark:text-gray-400">
                  Vui lòng thử lại sau
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Legend */}
        <div className="mt-8 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-[#111318] dark:text-white mb-4">Chú thích:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="size-4 rounded bg-green-100 border-2 border-green-200"></div>
              <span className="text-sm text-[#616e89] dark:text-gray-400">Còn trống</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 rounded bg-red-100 border-2 border-red-200"></div>
              <span className="text-sm text-[#616e89] dark:text-gray-400">Đã đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 rounded bg-yellow-100 border-2 border-yellow-200"></div>
              <span className="text-sm text-[#616e89] dark:text-gray-400">Bảo trì</span>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default CourtBooking;
