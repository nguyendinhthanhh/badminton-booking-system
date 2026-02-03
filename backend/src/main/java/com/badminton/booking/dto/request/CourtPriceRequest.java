package com.badminton.booking.dto.request;

import com.badminton.booking.entity.enums.DayType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class CourtPriceRequest {

    @NotNull(message = "Court ID is required")
    @Min(value = 1, message = "Court ID must be greater than 0")
    private Integer courtId;

    @NotNull(message = "Day type is required")
    private DayType dayType; // WEEKDAY, WEEKEND, HOLIDAY

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @NotNull(message = "Price per hour is required")
    @DecimalMin(value = "1000", message = "Price must be at least 1,000đ")
    private BigDecimal pricePerHour;

    private Boolean isActive = true;
}
