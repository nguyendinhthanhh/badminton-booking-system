package com.badminton.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Response kiểm tra khả dụng của sân
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResponse {

    private Integer courtId;
    private String courtName;
    private LocalDate date;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime requestedStart;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime requestedEnd;

    private boolean available;
    private String message;

    // Nếu không available, trả về các booking đang conflict
    private List<ConflictingBooking> conflicts;

    // Gợi ý các khung giờ trống gần nhất
    private List<AvailableSlot> suggestedSlots;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConflictingBooking {
        private Integer bookingId;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime effectiveEndTime; // Bao gồm buffer

        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailableSlot {
        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;

        private Integer durationMinutes;
    }
}

