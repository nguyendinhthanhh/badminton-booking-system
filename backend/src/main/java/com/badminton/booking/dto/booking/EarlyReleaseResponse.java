package com.badminton.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Response khi release slot sớm từ booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EarlyReleaseResponse {

    private boolean released;

    private String message;

    // Thông tin slot được release
    @JsonFormat(pattern = "HH:mm")
    private LocalTime releasedFrom;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime releasedTo;

    private Integer minutes;

    // ID của released slot mới tạo
    private Integer releasedSlotId;

    // Thông tin booking gốc
    private Integer sourceBookingId;
    private Integer courtId;
    private String courtName;
    private LocalDate playDate;

    // Thời gian gốc của booking
    @JsonFormat(pattern = "HH:mm")
    private LocalTime originalStartTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime originalEndTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime actualEndTime;
}

