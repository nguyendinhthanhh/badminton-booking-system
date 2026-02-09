package com.badminton.booking.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadmintonCourtResponse {

    private Integer id;
    private String name;
    private String status;
    private String type;
    private String location;
    private String description;
    private String imageUrl;
    private Integer capacity;

    // ===== THÔNG TIN GIÁ =====
    private BigDecimal minPricePerHour;
    private BigDecimal maxPricePerHour;

    // ===== GIỜ HOẠT ĐỘNG =====
    @JsonFormat(pattern = "HH:mm")
    private LocalTime openTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime closeTime;

    // ===== TRẠNG THÁI HÔM NAY =====
    private Boolean isAvailableToday;

    // ===== HÌNH ẢNH =====
    private java.util.List<String> images;
}
