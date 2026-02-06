package com.badminton.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * Response tính phí overtime
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OvertimeResponse {

    private Integer bookingId;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime scheduledEndTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime actualEndTime;

    private Integer overtimeMinutes;
    private BigDecimal overtimeRate; // Hệ số (1.5x)
    private BigDecimal basePricePerHour;
    private BigDecimal overtimeFee;

    private String message;
}

