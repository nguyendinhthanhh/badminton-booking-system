package com.badminton.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request để admin tạo booking cho khách walk-in
 * - Khách đến sân trực tiếp, không đặt trước
 * - Admin có thể tạo booking từ thời gian quá khứ (trong giới hạn cho phép)
 * - EndTime có thể null (open-ended) - khách chưa biết khi nào kết thúc
 */
@Data
public class WalkInBookingRequest {

    @NotNull(message = "Court ID is required")
    private Integer courtId;

    @NotNull(message = "Play date is required")
    private LocalDate playDate;

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    /**
     * End time - CÓ THỂ NULL
     * - Nếu null: open-ended booking, khách chưa biết khi nào kết thúc
     * - Hệ thống sẽ tạm tính đến giờ đóng cửa (22:00) hoặc estimatedDurationMinutes
     */
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    /**
     * Thời lượng dự kiến (phút) - dùng khi endTime = null
     * - Mặc định: 120 phút (2 tiếng)
     * - Slot từ startTime đến (startTime + estimatedDurationMinutes) sẽ bị BLOCK hoàn toàn
     * - Ví dụ: 60, 90, 120 phút
     */
    private Integer estimatedDurationMinutes;

    /**
     * Thời lượng tối đa có thể chơi (phút) - dùng cho soft-blocking
     * - Mặc định: 240 phút (4 tiếng) hoặc đến giờ đóng cửa
     * - Slot từ (startTime + estimatedDurationMinutes) đến (startTime + maxDurationMinutes)
     *   sẽ bị SOFT_BLOCK (hiển thị cảnh báo cho user, admin vẫn đặt được)
     */
    private Integer maxDurationMinutes;

    /**
     * Đánh dấu booking này là open-ended (chưa xác định giờ kết thúc)
     * - true: Khách chơi đến khi nào thì thôi
     * - false: Có giờ kết thúc cố định
     */
    private Boolean openEnded = false;

    /**
     * Thông tin khách hàng (có thể là guest hoặc user đã đăng ký)
     */
    private Integer userId;  // Nếu khách là user đã đăng ký

    // Thông tin guest (nếu không có userId)
    private String guestName;
    private String guestPhone;

    private String notes;

    /**
     * Trạng thái ban đầu:
     * - PLAYING: Khách đang chơi (mặc định)
     * - CONFIRMED: Đã xác nhận nhưng chưa check-in
     */
    private String initialStatus = "PLAYING";
}
