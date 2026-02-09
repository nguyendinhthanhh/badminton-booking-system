package com.badminton.booking.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingRequest {

    // Booking status: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    private String status;

    // Payment status: UNPAID, PAID, PARTIALLY_PAID, REFUNDED
    private String paymentStatus;

    // Change play date (only if status = PENDING)
    private LocalDate playDate;

    // Change court (only if status = PENDING)
    private Integer courtId;

    // Change time slots (only if status = PENDING)
    private List<Integer> slotIds;

    private java.time.LocalTime startTime;
    private java.time.LocalTime endTime;

    // Admin notes
    private String adminNote;

    // Check-in/Check-out times (for actual tracking)
    private LocalDateTime actualCheckInTime;
    private LocalDateTime actualCheckOutTime;
}
