import { useState, useEffect, useRef } from 'react';
import scheduleService from '../../services/scheduleService';
import Toast from '../../components/common/Toast';
import BookingDetailSkeleton from '../../components/common/BookingDetailSkeleton';
import useDataStore from '../../store/useDataStore';

const BookingSchedule = () => {
  const { 
    bookingSchedule: cachedSchedule,
    isCacheValid,
    setBookingSchedule,
    updateBookingInSchedule,
    invalidateBookingSchedule
  } = useDataStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, dailyRevenue: 0 });
  const [toast, setToast] = useState(null);
  const timelineScrollRef = useRef(null);
  const headerScrollRef = useRef(null);

  // Update current time every second (Vietnam timezone)
  useEffect(() => {
    const updateTime = () => {
      // Get current time in Vietnam timezone (UTC+7)
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const vietnamTime = new Date(utcTime + (7 * 3600000)); // UTC+7
      setCurrentTime(vietnamTime);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000); // Update every second
    return () => clearInterval(timer);
  }, []);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  // Fetch timeline data when date changes
  useEffect(() => {
    fetchTimeline();
  }, [selectedDate]);

  const fetchTimeline = async () => {
    // Check cache first
    const dateStr = selectedDate.toISOString().split('T')[0];
    const hasCachedData = cachedSchedule.data && 
                          cachedSchedule.selectedDate === dateStr &&
                          isCacheValid(cachedSchedule.lastFetch);

    if (hasCachedData) {
      console.log('Using cached booking schedule');
      // Use cached data
      const timelineData = cachedSchedule.data;
      
      if (timelineData.courts) {
        const mappedCourts = timelineData.courts.map(court => ({
          id: court.courtId,
          name: court.courtName,
          type: court.courtType,
          status: court.courtStatus
        }));
        setCourts(mappedCourts);

        const mappedBookings = [];
        timelineData.courts.forEach(court => {
          if (court.slots) {
            court.slots.forEach(slot => {
              if (slot.status === 'BOOKED' || slot.status === 'PENDING') {
                mappedBookings.push({
                  id: slot.bookingDetailId || slot.bookingId || slot.slotId,
                  courtId: court.courtId,
                  startTime: slot.startTime.substring(0, 5),
                  endTime: slot.endTime.substring(0, 5),
                  status: slot.status === 'BOOKED' ? 'CONFIRMED' : 'PENDING',
                  customerName: slot.customerName || 'Unknown',
                  phone: slot.customerPhone,
                  payment: slot.status === 'BOOKED' ? 'paid' : 'pending',
                  price: slot.price
                });
              }
            });
          }
        });
        setBookings(mappedBookings);
      }
      
      if (timelineData.statistics) {
        setStats({
          totalBookings: timelineData.statistics.bookedSlots || 0,
          dailyRevenue: timelineData.statistics.totalRevenue || 0
        });
      }
      
      setLoading(false);
      return;
    }

    // Fetch from API
    console.log('Fetching booking schedule from API');
    setLoading(true);
    try {
      const [timelineData, statsData] = await Promise.all([
        scheduleService.getTimeline(selectedDate),
        scheduleService.getStatistics(selectedDate)
      ]);
      
      // Cache the data
      setBookingSchedule(timelineData, dateStr);
      
      if (timelineData.courts) {
        const mappedCourts = timelineData.courts.map(court => ({
          id: court.courtId,
          name: court.courtName,
          type: court.courtType,
          status: court.courtStatus
        }));
        setCourts(mappedCourts);

        const mappedBookings = [];
        timelineData.courts.forEach(court => {
          if (court.slots) {
            court.slots.forEach(slot => {
              if (slot.status === 'BOOKED' || slot.status === 'PENDING') {
                mappedBookings.push({
                  id: slot.bookingDetailId || slot.bookingId || slot.slotId,
                  courtId: court.courtId,
                  startTime: slot.startTime.substring(0, 5),
                  endTime: slot.endTime.substring(0, 5),
                  status: slot.status === 'BOOKED' ? 'CONFIRMED' : 'PENDING',
                  customerName: slot.customerName || 'Unknown',
                  phone: slot.customerPhone,
                  payment: slot.status === 'BOOKED' ? 'paid' : 'pending',
                  price: slot.price
                });
              }
            });
          }
        });
        console.log('Total courts:', mappedCourts.length);
        console.log('Total bookings found:', mappedBookings.length);
        console.log('Bookings:', mappedBookings);
        setBookings(mappedBookings);
      }
      
      // Process statistics data
      if (statsData) {
        setStats({
          totalBookings: statsData.bookedSlots || 0,
          dailyRevenue: statsData.totalRevenue || 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getBookingPosition = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = (startHour - 6) * 60 + startMin;
    const endMinutes = (endHour - 6) * 60 + endMin;
    const duration = endMinutes - startMinutes;
    
    const left = (startMinutes / 60) * 100;
    const width = (duration / 60) * 100;
    
    return { left: `${left}px`, width: `${width}px` };
  };

  const getCurrentTimePosition = () => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (!isToday) return null;
    
    // Use currentTime state which is already in Vietnam timezone
    const currentHour = currentTime.getHours();
    const currentMin = currentTime.getMinutes();
    const currentSec = currentTime.getSeconds();
    
    // Timeline starts at 6:00 AM and ends at 11:00 PM (23:00)
    if (currentHour < 6 || currentHour >= 24) return null;
    
    // Calculate total seconds from 6:00 AM for more precise positioning
    const totalSecondsFromStart = (currentHour - 6) * 3600 + currentMin * 60 + currentSec;
    
    // Each hour is 100px wide, so position = (seconds / 3600) * 100
    const position = (totalSecondsFromStart / 3600) * 100;
    
    return `${position}px`;
  };

  const handleBookingClick = async (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetail(true);
    setLoadingDetail(true);
    setBookingDetail(null);
    setIsEditMode(false);
    
    try {
      // Fetch detailed booking information
      const detail = await scheduleService.getBookingDetail(booking.id);
      console.log('Booking detail from API:', detail);
      setBookingDetail(detail);
      setEditFormData({
        status: detail.status || '',
        paymentStatus: detail.paymentStatus || '',
        playDate: detail.playDate ? detail.playDate.split('T')[0] : '',
        courtId: detail.courtId || '',
        slotIds: detail.slots?.map(s => s.slotId) || [],
        adminNote: detail.adminNote || '',
        actualCheckInTime: detail.actualCheckInTime ? new Date(detail.actualCheckInTime).toISOString().slice(0, 16) : '',
        actualCheckOutTime: detail.actualCheckOutTime ? new Date(detail.actualCheckOutTime).toISOString().slice(0, 16) : ''
      });
      console.log('Edit form data initialized:', {
        status: detail.status || '',
        paymentStatus: detail.paymentStatus || '',
        playDate: detail.playDate ? detail.playDate.split('T')[0] : '',
        courtId: detail.courtId || '',
        slotIds: detail.slots?.map(s => s.slotId) || [],
        adminNote: detail.adminNote || '',
        actualCheckInTime: detail.actualCheckInTime ? new Date(detail.actualCheckInTime).toISOString().slice(0, 16) : '',
        actualCheckOutTime: detail.actualCheckOutTime ? new Date(detail.actualCheckOutTime).toISOString().slice(0, 16) : ''
      });
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      showToast('Lỗi khi tải chi tiết booking', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleEditBooking = () => {
    console.log('Entering edit mode with data:', editFormData);
    console.log('Current booking detail:', bookingDetail);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to original
    setEditFormData({
      status: bookingDetail.status || '',
      paymentStatus: bookingDetail.paymentStatus || '',
      playDate: bookingDetail.playDate ? bookingDetail.playDate.split('T')[0] : '',
      courtId: bookingDetail.courtId || '',
      slotIds: bookingDetail.slots?.map(s => s.slotId) || [],
      adminNote: bookingDetail.adminNote || '',
      actualCheckInTime: bookingDetail.actualCheckInTime ? new Date(bookingDetail.actualCheckInTime).toISOString().slice(0, 16) : '',
      actualCheckOutTime: bookingDetail.actualCheckOutTime ? new Date(bookingDetail.actualCheckOutTime).toISOString().slice(0, 16) : ''
    });
  };

  const handleSaveBooking = async () => {
    setSavingBooking(true);
    try {
      const updateData = {
        status: editFormData.status,
        paymentStatus: editFormData.paymentStatus,
        playDate: editFormData.playDate,
        courtId: parseInt(editFormData.courtId),
        slotIds: editFormData.slotIds,
        adminNote: editFormData.adminNote || null,
        actualCheckInTime: editFormData.actualCheckInTime ? new Date(editFormData.actualCheckInTime).toISOString() : null,
        actualCheckOutTime: editFormData.actualCheckOutTime ? new Date(editFormData.actualCheckOutTime).toISOString() : null
      };

      await scheduleService.updateBooking(bookingDetail.bookingId, updateData);
      
      // Update cache
      updateBookingInSchedule({
        bookingDetailId: bookingDetail.bookingDetailId,
        ...updateData
      });
      
      showToast('Cập nhật booking thành công', 'success');
      setIsEditMode(false);
      
      // Refresh booking detail
      const updatedDetail = await scheduleService.getBookingDetail(bookingDetail.bookingId);
      setBookingDetail(updatedDetail);
      setEditFormData({
        status: updatedDetail.status || '',
        paymentStatus: updatedDetail.paymentStatus || '',
        playDate: updatedDetail.playDate ? updatedDetail.playDate.split('T')[0] : '',
        courtId: updatedDetail.courtId || '',
        slotIds: updatedDetail.slots?.map(s => s.slotId) || [],
        adminNote: updatedDetail.adminNote || '',
        actualCheckInTime: updatedDetail.actualCheckInTime ? new Date(updatedDetail.actualCheckInTime).toISOString().slice(0, 16) : '',
        actualCheckOutTime: updatedDetail.actualCheckOutTime ? new Date(updatedDetail.actualCheckOutTime).toISOString().slice(0, 16) : ''
      });
      
      // Refresh timeline
      await fetchTimeline();
    } catch (error) {
      console.error('Error saving booking:', error);
      showToast('Lỗi khi cập nhật booking', 'error');
    } finally {
      setSavingBooking(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const updateData = {
        status: 'CONFIRMED',
        paymentStatus: bookingDetail.paymentStatus,
        playDate: bookingDetail.playDate,
        courtId: bookingDetail.courtId,
        slotIds: bookingDetail.slots.map(slot => slot.slotId),
        adminNote: bookingDetail.adminNote,
        actualCheckInTime: new Date().toISOString(),
        actualCheckOutTime: bookingDetail.actualCheckOutTime
      };
      
      await scheduleService.updateBooking(bookingDetail.bookingId, updateData);
      showToast('Check-in thành công', 'success');
      
      // Refresh booking detail
      const updatedDetail = await scheduleService.getBookingDetail(bookingDetail.bookingId);
      setBookingDetail(updatedDetail);
      setEditFormData({
        ...editFormData,
        actualCheckInTime: new Date().toISOString().slice(0, 16),
        status: 'CONFIRMED'
      });
      
      // Refresh timeline
      await fetchTimeline();
    } catch (error) {
      console.error('Error checking in:', error);
      showToast('Lỗi khi check-in', 'error');
    }
  };

  const handleQuickCheckIn = () => {
    setEditFormData(prev => ({
      ...prev,
      actualCheckInTime: new Date().toISOString().slice(0, 16),
      status: 'CONFIRMED'
    }));
  };

  const handleQuickCheckOut = () => {
    setEditFormData(prev => ({
      ...prev,
      actualCheckOutTime: new Date().toISOString().slice(0, 16)
    }));
  };

  // Sync scroll between header and timeline
  const handleHeaderScroll = (e) => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Court Schedule</h1>
            <p className="text-gray-600 text-sm mt-1">Real-time timeline of all court reservations.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-gray-600">chevron_left</span>
            </button>
            <div className="relative date-picker-container">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-purple-600">calendar_today</span>
                <span className="font-semibold text-gray-900">{formatDate(selectedDate)}</span>
              </button>
              
              {/* Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => handleDateSelect(new Date(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-gray-600">chevron_right</span>
            </button>
            <button onClick={goToToday} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors">
              TODAY
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-600 font-medium">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600 font-medium">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span className="text-sm text-gray-600 font-medium">Available</span>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex">
              {/* Fixed Court Names Column Skeleton */}
              <div className="flex-shrink-0 bg-gray-50">
                <div className="w-48 px-4 py-3 border-b border-gray-200">
                  <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className={`w-48 px-4 py-6 ${idx !== 5 ? 'border-b border-gray-200' : ''}`}>
                    <div className="h-5 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Scrollable Timeline Skeleton */}
              <div className="flex-1 overflow-hidden">
                <div className="min-w-max">
                  {/* Time Header Skeleton */}
                  <div className="flex border-b border-gray-200 bg-gray-50">
                    {[...Array(18)].map((_, idx) => (
                      <div key={idx} className="w-[100px] flex-shrink-0 text-center py-3 border-l border-gray-200">
                        <div className="h-3 bg-slate-200 rounded w-12 mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>

                  {/* Court Rows Skeleton */}
                  {[1, 2, 3, 4, 5].map((courtIdx) => (
                    <div 
                      key={courtIdx}
                      className={`flex relative ${courtIdx !== 5 ? 'border-b border-gray-200' : ''}`}
                      style={{ height: '80px' }}
                    >
                      {[...Array(18)].map((_, idx) => (
                        <div key={idx} className="w-[100px] flex-shrink-0 border-l border-gray-100"></div>
                      ))}
                      {/* Random booking blocks skeleton */}
                      {courtIdx % 2 === 0 && (
                        <div
                          className="absolute top-2 bottom-2 rounded-lg bg-slate-200 animate-pulse"
                          style={{ left: `${courtIdx * 150}px`, width: '200px' }}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : courts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-500">Không có dữ liệu sân cho ngày này</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header with horizontal scroll */}
            <div className="flex border-b border-gray-200">
              {/* Fixed Court Label */}
              <div className="flex-shrink-0 w-48 bg-gray-50 px-4 py-3 border-r border-gray-200 sticky left-0 z-20">
                <span className="font-semibold text-xs text-gray-600 uppercase">Court</span>
              </div>
              
              {/* Scrollable Time Header */}
              <div 
                ref={headerScrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden hide-scrollbar"
                onScroll={handleHeaderScroll}
              >
                <div className="flex bg-gray-50 min-w-max">
                  {timeSlots.map((time, idx) => (
                    <div key={idx} className="w-[100px] flex-shrink-0 text-center py-3 border-l border-gray-200">
                      <span className="text-xs font-medium text-gray-600">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content with vertical scroll */}
            <div className="flex max-h-[500px] overflow-y-auto relative">
              {/* Fixed Court Names */}
              <div className="flex-shrink-0 w-48 bg-gray-50 border-r border-gray-200 sticky left-0 z-10">
                {courts.map((court, courtIdx) => (
                  <div 
                    key={court.id} 
                    className={`px-4 py-6 bg-gray-50 ${courtIdx !== courts.length - 1 ? 'border-b border-gray-200' : ''}`}
                    style={{ height: '80px' }}
                  >
                    <div className="font-bold text-gray-900">{court.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{court.type}</div>
                  </div>
                ))}
              </div>

              {/* Timeline with horizontal scroll (hidden scrollbar) */}
              <div className="flex-1">
                <div 
                  ref={timelineScrollRef}
                  className="overflow-x-auto hide-scrollbar"
                >
                  <div className="min-w-max relative">
                    {courts.map((court, courtIdx) => (
                      <div 
                        key={court.id} 
                        className={`flex relative ${courtIdx !== courts.length - 1 ? 'border-b border-gray-200' : ''}`}
                        style={{ height: '80px' }}
                      >
                        {/* Time Grid Background */}
                        {timeSlots.map((_, idx) => (
                          <div key={idx} className="w-[100px] flex-shrink-0 border-l border-gray-100 h-full"></div>
                        ))}

                        {/* Bookings */}
                        {bookings
                          .filter(b => b.courtId === court.id)
                          .map(booking => {
                            const position = getBookingPosition(booking.startTime, booking.endTime);
                            return (
                              <div
                                key={booking.id}
                                className={`absolute top-2 bottom-2 rounded-lg px-3 py-2 cursor-pointer transition-all hover:shadow-lg ${
                                  booking.status === 'CONFIRMED' ? 'bg-blue-600' : 'bg-orange-500'
                                }`}
                                style={position}
                                onClick={() => handleBookingClick(booking)}
                              >
                                <div className="text-white font-semibold text-sm truncate">{booking.customerName}</div>
                                <div className="text-white text-xs opacity-90">{booking.startTime} - {booking.endTime}</div>
                              </div>
                            );
                          })}
                      </div>
                    ))}

                    {/* Current Time Indicator */}
                    {getCurrentTimePosition() && (
                      <div
                        className="absolute top-0 z-10 pointer-events-none"
                        style={{ left: getCurrentTimePosition(), height: `${courts.length * 80}px` }}
                      >
                        {/* Red vertical line */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500"></div>
                        
                        {/* Top circle */}
                        <div className="absolute -top-2 -left-1.5 w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
                        
                        {/* Time label on the line */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold whitespace-nowrap shadow-lg">
                          {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">event_available</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Bookings</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalBookings} Sessions</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">payments</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Daily Revenue</div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.dailyRevenue)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowBookingDetail(false)}
            ></div>

            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">event_available</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Chi tiết đặt sân</h3>
                      <p className="text-sm text-gray-600">Booking #{bookingDetail?.bookingId || selectedBooking.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowBookingDetail(false)} 
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {loadingDetail ? (
                  <BookingDetailSkeleton />
                ) : bookingDetail ? (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">person</span>
                        Thông tin khách hàng
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Tên khách hàng</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.customerPhone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.customerEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Court Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">stadium</span>
                        Thông tin sân
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Tên sân</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.courtName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Loại sân</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.courtType}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Vị trí</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.courtLocation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">schedule</span>
                        Thông tin đặt sân
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Play Date */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ngày chơi</p>
                          {isEditMode ? (
                            <input
                              type="date"
                              value={editFormData.playDate || ''}
                              onChange={(e) => {
                                console.log('Play date changed to:', e.target.value);
                                setEditFormData({ ...editFormData, playDate: e.target.value });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 font-semibold"
                            />
                          ) : (
                            <p className="font-semibold text-gray-900">{new Date(bookingDetail.playDate).toLocaleDateString('vi-VN')}</p>
                          )}
                        </div>

                        {/* Booking Date */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ngày đặt</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.bookingDate ? new Date(bookingDetail.bookingDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Trạng thái booking</p>
                          {isEditMode ? (
                            <select
                              value={editFormData.status || ''}
                              onChange={(e) => {
                                console.log('Status changed to:', e.target.value);
                                setEditFormData({ ...editFormData, status: e.target.value });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-gray-900 bg-white"
                            >
                              <option value="">-- Chọn trạng thái --</option>
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="CANCELLED">CANCELLED</option>
                              <option value="COMPLETED">COMPLETED</option>
                            </select>
                          ) : (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                              bookingDetail.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                              bookingDetail.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                              bookingDetail.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {bookingDetail.status}
                            </span>
                          )}
                        </div>

                        {/* Payment Status */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Trạng thái thanh toán</p>
                          {isEditMode ? (
                            <select
                              value={editFormData.paymentStatus || ''}
                              onChange={(e) => {
                                console.log('Payment status changed to:', e.target.value);
                                setEditFormData({ ...editFormData, paymentStatus: e.target.value });
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-gray-900 bg-white"
                            >
                              <option value="">-- Chọn trạng thái --</option>
                              <option value="PENDING">PENDING</option>
                              <option value="PAID">PAID</option>
                              <option value="REFUNDED">REFUNDED</option>
                            </select>
                          ) : (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                              bookingDetail.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 
                              bookingDetail.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {bookingDetail.paymentStatus}
                            </span>
                          )}
                        </div>

                        {/* Check-in Time */}
                        {(isEditMode || bookingDetail.actualCheckInTime) && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Thời gian check-in</p>
                            {isEditMode ? (
                              <div className="flex gap-1">
                                <input
                                  type="datetime-local"
                                  value={editFormData.actualCheckInTime || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, actualCheckInTime: e.target.value })}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 font-semibold bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={handleQuickCheckIn}
                                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                  title="Check-in ngay"
                                >
                                  <span className="material-symbols-outlined text-sm">login</span>
                                </button>
                              </div>
                            ) : (
                              <p className="font-semibold text-gray-900">
                                {new Date(bookingDetail.actualCheckInTime).toLocaleString('vi-VN')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Check-out Time */}
                        {(isEditMode || bookingDetail.actualCheckOutTime) && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Thời gian check-out</p>
                            {isEditMode ? (
                              <div className="flex gap-1">
                                <input
                                  type="datetime-local"
                                  value={editFormData.actualCheckOutTime || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, actualCheckOutTime: e.target.value })}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 font-semibold bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={handleQuickCheckOut}
                                  className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                                  title="Check-out ngay"
                                >
                                  <span className="material-symbols-outlined text-sm">logout</span>
                                </button>
                              </div>
                            ) : (
                              <p className="font-semibold text-gray-900">
                                {new Date(bookingDetail.actualCheckOutTime).toLocaleString('vi-VN')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Admin Note */}
                        {(isEditMode || bookingDetail.adminNote) && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500 mb-1">Ghi chú của admin</p>
                            {isEditMode ? (
                              <textarea
                                value={editFormData.adminNote || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, adminNote: e.target.value })}
                                rows="2"
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 bg-white"
                                placeholder="Nhập ghi chú..."
                              />
                            ) : (
                              <p className="font-semibold text-gray-900 bg-yellow-50 p-2 rounded border border-yellow-200">
                                {bookingDetail.adminNote}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-600">access_time</span>
                        Khung giờ đã đặt
                      </h4>
                      <div className="space-y-2">
                        {bookingDetail.slots.map((slot, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">{idx + 1}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                                </p>
                                <p className="text-xs text-gray-500">{slot.periodName} • {slot.durationMinutes} phút</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(slot.price)}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                slot.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {slot.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">Tổng tiền</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingDetail.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Không thể tải thông tin booking
                  </div>
                )}
              </div>

              {/* Footer */}
              {bookingDetail && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                  {isEditMode ? (
                    <>
                      <button 
                        onClick={handleCancelEdit}
                        className="flex-1 py-3 bg-white border border-slate-300 text-gray-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        disabled={savingBooking}
                      >
                        <span className="material-symbols-outlined">close</span>
                        Hủy
                      </button>
                      <button 
                        onClick={handleSaveBooking}
                        disabled={savingBooking}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {savingBooking ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">save</span>
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleCheckIn}
                        disabled={bookingDetail.actualCheckInTime}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        {bookingDetail.actualCheckInTime ? 'Đã check-in' : 'Check-in'}
                      </button>
                      <button 
                        onClick={handleEditBooking}
                        className="flex-1 py-3 bg-white border border-slate-300 text-gray-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">edit</span>
                        Chỉnh sửa
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default BookingSchedule;
