package com.badminton.booking.dto.response;

import com.badminton.booking.entity.enums.DayType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
public class CourtPriceResponse {
    private Integer id;
    private Integer courtId;
    private String courtName;
    private DayType dayType;
    private String dayTypeName; // "Ngày thường", "Cuối tuần", "Ngày lễ"

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private BigDecimal pricePerHour;
    private Boolean isActive;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
