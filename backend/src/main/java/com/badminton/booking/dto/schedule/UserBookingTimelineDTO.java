package com.badminton.booking.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBookingTimelineDTO {
    private Integer bookingId;
    private Integer bookingDetailId;
    private LocalDate playDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String courtName;
    private Integer courtId;
    private String status;
    private String paymentStatus;
    private BigDecimal price;
    private String periodName;
}

