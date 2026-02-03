package com.badminton.booking.service;

import com.badminton.booking.dto.schedule.*;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleTimelineService {

    /**
     * Get timeline schedule for all courts on a specific date (Admin view)
     */
    ScheduleTimelineDTO getScheduleTimeline(LocalDate date);

    /**
     * Get timeline schedule for a specific court on a date
     */
    CourtTimelineDTO getCourtTimeline(Integer courtId, LocalDate date);

    /**
     * Get timeline schedule for a date range (Admin view - weekly/monthly)
     */
    List<ScheduleTimelineDTO> getScheduleTimelineRange(LocalDate startDate, LocalDate endDate);

    /**
     * Get user's booking timeline (User view)
     */
    List<UserBookingTimelineDTO> getUserBookingTimeline(Integer userId, LocalDate startDate, LocalDate endDate);

    /**
     * Get user's upcoming bookings
     */
    List<UserBookingTimelineDTO> getUserUpcomingBookings(Integer userId);

    /**
     * Get schedule statistics for a date
     */
    ScheduleStatisticsDTO getScheduleStatistics(LocalDate date);

    /**
     * Get booking detail by booking ID
     */
    BookingDetailInfoDTO getBookingDetail(Integer bookingId);

    /**
     * Update booking information (Admin)
     * - Can update status, payment status
     * - Can update play date, court, slots only if status is PENDING
     * - Can record actual check-in/check-out times
     */
    BookingDetailInfoDTO updateBooking(Integer bookingId, UpdateBookingRequest request);

    /**
     * Cancel a booking (Admin/User)
     */
    BookingDetailInfoDTO cancelBooking(Integer bookingId, String reason);
}
