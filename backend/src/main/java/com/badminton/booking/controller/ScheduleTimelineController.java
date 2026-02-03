package com.badminton.booking.controller;

import com.badminton.booking.dto.schedule.*;
import com.badminton.booking.service.ScheduleTimelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
@Tag(name = "Schedule Timeline", description = "APIs for viewing booking schedule timeline")
public class ScheduleTimelineController {

    private final ScheduleTimelineService scheduleTimelineService;

    @GetMapping("/admin/timeline")
    @Operation(summary = "Get schedule timeline for all courts on a specific date (Admin)",
               description = "Returns timeline view with all courts and their booking slots for the given date")
    public ResponseEntity<ScheduleTimelineDTO> getScheduleTimeline(
            @Parameter(description = "Date to view schedule (format: yyyy-MM-dd)", example = "2026-02-02")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        ScheduleTimelineDTO timeline = scheduleTimelineService.getScheduleTimeline(date);
        return ResponseEntity.ok(timeline);
    }

    @GetMapping("/admin/timeline/range")
    @Operation(summary = "Get schedule timeline for a date range (Admin)",
               description = "Returns timeline view for multiple days - useful for weekly/monthly view")
    public ResponseEntity<List<ScheduleTimelineDTO>> getScheduleTimelineRange(
            @Parameter(description = "Start date (format: yyyy-MM-dd)", example = "2026-02-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (format: yyyy-MM-dd)", example = "2026-02-07")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ScheduleTimelineDTO> timelines = scheduleTimelineService.getScheduleTimelineRange(startDate, endDate);
        return ResponseEntity.ok(timelines);
    }

    @GetMapping("/admin/court/{courtId}/timeline")
    @Operation(summary = "Get timeline for a specific court (Admin)",
               description = "Returns detailed timeline for a single court on the given date")
    public ResponseEntity<CourtTimelineDTO> getCourtTimeline(
            @Parameter(description = "Court ID") @PathVariable Integer courtId,
            @Parameter(description = "Date to view (format: yyyy-MM-dd)", example = "2026-02-02")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        CourtTimelineDTO courtTimeline = scheduleTimelineService.getCourtTimeline(courtId, date);
        return ResponseEntity.ok(courtTimeline);
    }

    @GetMapping("/admin/statistics")
    @Operation(summary = "Get schedule statistics for a date (Admin)",
               description = "Returns booking statistics including occupancy rate, revenue, etc.")
    public ResponseEntity<ScheduleStatisticsDTO> getScheduleStatistics(
            @Parameter(description = "Date to get statistics (format: yyyy-MM-dd)", example = "2026-02-02")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        ScheduleStatisticsDTO statistics = scheduleTimelineService.getScheduleStatistics(date);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/admin/booking/{bookingId}")
    @Operation(summary = "Get booking detail (Admin)",
               description = "Returns detailed information about a specific booking including customer info, court, slots")
    public ResponseEntity<BookingDetailInfoDTO> getBookingDetail(
            @Parameter(description = "Booking ID") @PathVariable Integer bookingId) {

        BookingDetailInfoDTO bookingDetail = scheduleTimelineService.getBookingDetail(bookingId);
        return ResponseEntity.ok(bookingDetail);
    }

    @PutMapping("/admin/booking/{bookingId}")
    @Operation(summary = "Update booking (Admin)",
               description = "Update booking information. Can update status, payment status always. " +
                           "Can update play date, court, slots only when status is PENDING.")
    public ResponseEntity<BookingDetailInfoDTO> updateBooking(
            @Parameter(description = "Booking ID") @PathVariable Integer bookingId,
            @RequestBody UpdateBookingRequest request) {

        BookingDetailInfoDTO updatedBooking = scheduleTimelineService.updateBooking(bookingId, request);
        return ResponseEntity.ok(updatedBooking);
    }

    @PostMapping("/admin/booking/{bookingId}/cancel")
    @Operation(summary = "Cancel booking (Admin)",
               description = "Cancel a PENDING or CONFIRMED booking. Cannot cancel past or completed bookings.")
    public ResponseEntity<BookingDetailInfoDTO> cancelBooking(
            @Parameter(description = "Booking ID") @PathVariable Integer bookingId,
            @Parameter(description = "Cancellation reason") @RequestParam(required = false) String reason) {

        BookingDetailInfoDTO cancelledBooking = scheduleTimelineService.cancelBooking(bookingId, reason);
        return ResponseEntity.ok(cancelledBooking);
    }

    @PatchMapping("/admin/booking/{bookingId}/status")
    @Operation(summary = "Update booking status (Admin)",
               description = "Quick update for booking status only. Valid transitions: " +
                           "PENDING → CONFIRMED/CANCELLED, CONFIRMED → COMPLETED/CANCELLED/NO_SHOW")
    public ResponseEntity<BookingDetailInfoDTO> updateBookingStatus(
            @Parameter(description = "Booking ID") @PathVariable Integer bookingId,
            @Parameter(description = "New status") @RequestParam String status) {

        UpdateBookingRequest request = new UpdateBookingRequest();
        request.setStatus(status);
        BookingDetailInfoDTO updatedBooking = scheduleTimelineService.updateBooking(bookingId, request);
        return ResponseEntity.ok(updatedBooking);
    }

    @PatchMapping("/admin/booking/{bookingId}/payment-status")
    @Operation(summary = "Update payment status (Admin)",
               description = "Update payment status of a booking. Values: UNPAID, PAID, PARTIALLY_PAID, REFUNDED")
    public ResponseEntity<BookingDetailInfoDTO> updatePaymentStatus(
            @Parameter(description = "Booking ID") @PathVariable Integer bookingId,
            @Parameter(description = "New payment status") @RequestParam String paymentStatus) {

        UpdateBookingRequest request = new UpdateBookingRequest();
        request.setPaymentStatus(paymentStatus);
        BookingDetailInfoDTO updatedBooking = scheduleTimelineService.updateBooking(bookingId, request);
        return ResponseEntity.ok(updatedBooking);
    }

    @GetMapping("/user/{userId}/bookings")
    @Operation(summary = "Get user's booking timeline",
               description = "Returns all bookings for a user within the specified date range")
    public ResponseEntity<List<UserBookingTimelineDTO>> getUserBookingTimeline(
            @Parameter(description = "User ID") @PathVariable Integer userId,
            @Parameter(description = "Start date (format: yyyy-MM-dd)", example = "2026-02-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (format: yyyy-MM-dd)", example = "2026-02-28")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<UserBookingTimelineDTO> bookings = scheduleTimelineService.getUserBookingTimeline(userId, startDate, endDate);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/user/{userId}/upcoming")
    @Operation(summary = "Get user's upcoming bookings",
               description = "Returns all future bookings for a user starting from today")
    public ResponseEntity<List<UserBookingTimelineDTO>> getUserUpcomingBookings(
            @Parameter(description = "User ID") @PathVariable Integer userId) {

        List<UserBookingTimelineDTO> bookings = scheduleTimelineService.getUserUpcomingBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    // ==================== PUBLIC APIs ====================

    @GetMapping("/public/timeline")
    @Operation(summary = "Get public schedule timeline",
               description = "Returns timeline view for customers to see available slots (without customer details)")
    public ResponseEntity<ScheduleTimelineDTO> getPublicScheduleTimeline(
            @Parameter(description = "Date to view schedule (format: yyyy-MM-dd)", example = "2026-02-02")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        ScheduleTimelineDTO timeline = scheduleTimelineService.getScheduleTimeline(date);

        // Remove sensitive customer information for public view
        timeline.getCourts().forEach(court ->
            court.getSlots().forEach(slot -> {
                slot.setCustomerName(null);
                slot.setCustomerPhone(null);
            })
        );

        return ResponseEntity.ok(timeline);
    }

    @GetMapping("/public/court/{courtId}/timeline")
    @Operation(summary = "Get public timeline for a specific court",
               description = "Returns timeline for a single court without customer details")
    public ResponseEntity<CourtTimelineDTO> getPublicCourtTimeline(
            @Parameter(description = "Court ID") @PathVariable Integer courtId,
            @Parameter(description = "Date to view (format: yyyy-MM-dd)", example = "2026-02-02")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        CourtTimelineDTO courtTimeline = scheduleTimelineService.getCourtTimeline(courtId, date);

        // Remove sensitive customer information
        courtTimeline.getSlots().forEach(slot -> {
            slot.setCustomerName(null);
            slot.setCustomerPhone(null);
        });

        return ResponseEntity.ok(courtTimeline);
    }
}
