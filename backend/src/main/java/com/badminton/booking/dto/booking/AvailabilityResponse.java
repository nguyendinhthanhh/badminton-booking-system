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

    /**
     * Soft-blocked: Slot có thể bị ảnh hưởng bởi walk-in booking đang chơi
     * - true: Có walk-in open-ended đang chơi, slot này nằm trong vùng soft-block
     * - User vẫn có thể đặt nhưng sẽ được cảnh báo
     */
    private boolean softBlocked;
    private String softBlockWarning;
    private List<SoftBlockInfo> softBlockedBy;

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
        private Boolean openEnded;  // Thêm để biết đây có phải open-ended không
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

        /**
         * Trạng thái của slot:
         * - AVAILABLE: Hoàn toàn trống
         * - SOFT_BLOCKED: Có thể bị ảnh hưởng bởi walk-in đang chơi
         */
        private String slotStatus;
        private String warning;
    }

    /**
     * Thông tin về booking đang gây soft-block
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SoftBlockInfo {
        private Integer bookingId;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime walkInStartTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime estimatedEndTime;

        @JsonFormat(pattern = "HH:mm")
        private LocalTime maxEndTime;

        private String guestName;
        private String message;
    }
}
