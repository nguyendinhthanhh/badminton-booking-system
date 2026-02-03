package com.badminton.booking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
public class TimeSlotResponse {
    private Integer id;
    private LocalTime startTime;
    private LocalTime endTime;
    private String periodName;
    private Boolean isActive;
}
