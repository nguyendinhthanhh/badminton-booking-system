package com.badminton.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

/**
 * Request gia hạn booking
 *
 * Ví dụ:
 * {
 *   "extensionMinutes": 60
 * }
 * hoặc
 * {
 *   "newEndTime": "11:00"
 * }
 */
@Data
public class ExtendBookingRequest {

    // Cách 1: Gia hạn theo số phút
    @Min(value = 30, message = "Extension must be at least 30 minutes")
    private Integer extensionMinutes;

    // Cách 2: Gia hạn đến giờ cụ thể
    @JsonFormat(pattern = "HH:mm")
    private LocalTime newEndTime;
}

