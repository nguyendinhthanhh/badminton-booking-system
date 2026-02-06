package com.badminton.booking.service;

import com.badminton.booking.dto.booking.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Service xử lý booking sân - KHÔNG dùng slot, chỉ dùng startTime-endTime
 */
public interface BookingService {

    /**
     * Kiểm tra overlap booking
     * Công thức: (start < existingEnd + buffer) && (end > existingStart)
     */
    AvailabilityResponse checkAvailability(Integer courtId, LocalDate playDate,
                                           LocalTime startTime, LocalTime endTime);

    /**
     * Tính giá booking - tự động tách theo nhiều khung giá
     * Ví dụ: 07:00-10:00 = (07:00-08:00 x 60k) + (08:00-10:00 x 80k) = 220k
     */
    PriceCalculationResponse calculatePrice(Integer courtId, LocalDate playDate,
                                            LocalTime startTime, LocalTime endTime);

    /**
     * Tạo booking mới
     */
    BookingResponse createBooking(Integer userId, CreateBookingRequest request);

    /**
     * Gia hạn booking - chỉ cho phép nếu giờ tiếp theo còn trống
     */
    BookingResponse extendBooking(Integer bookingId, ExtendBookingRequest request);

    /**
     * Tính phí overtime khi khách về muộn
     */
    OvertimeResponse calculateOvertimeFee(Integer bookingId, LocalTime actualEndTime);

    /**
     * Hoàn thành booking và tính phí overtime nếu có
     */
    BookingResponse completeBooking(Integer bookingId, LocalTime actualEndTime);

    /**
     * Lấy thông tin booking
     */
    BookingResponse getBooking(Integer bookingId);

    /**
     * Cập nhật trạng thái booking
     */
    BookingResponse updateBookingStatus(Integer bookingId, String newStatus);

    /**
     * Hủy booking
     */
    BookingResponse cancelBooking(Integer bookingId, String reason);

    /**
     * User tự hủy booking của mình (chỉ khi đang PENDING)
     */
    BookingResponse cancelMyBooking(Integer userId, Integer bookingId, String reason);

    /**
     * Lấy danh sách booking của user
     */
    List<BookingResponse> getUserBookings(Integer userId, LocalDate fromDate, LocalDate toDate);

    /**
     * Lấy tất cả booking của user với filter tùy chọn
     */
    List<BookingResponse> getUserBookingsWithFilter(Integer userId, LocalDate fromDate, LocalDate toDate,
                                                     String status, String paymentStatus);

    /**
     * Lấy danh sách booking của sân trong ngày
     */
    List<BookingResponse> getCourtBookings(Integer courtId, LocalDate date);

    /**
     * Check-in booking (chuyển sang PLAYING)
     */
    BookingResponse checkIn(Integer bookingId);

    /**
     * Lấy các khung giờ trống của sân trong ngày
     */
    List<AvailabilityResponse.AvailableSlot> getAvailableSlots(Integer courtId, LocalDate date);
}
