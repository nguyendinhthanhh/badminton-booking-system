package com.badminton.booking.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class TimeSlotRequest {

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String periodName; // "Sáng sớm", "Sáng", "Trưa", "Chiều", "Tối", "Giờ vàng"

    private Boolean isActive = true;
}
