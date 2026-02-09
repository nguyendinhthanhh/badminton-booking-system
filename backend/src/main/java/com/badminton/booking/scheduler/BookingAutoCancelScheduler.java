package com.badminton.booking.scheduler;

import com.badminton.booking.entity.Booking;
import com.badminton.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Scheduled job để tự động hủy booking nếu không check-in sau 20 phút
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingAutoCancelScheduler {

    private final BookingRepository bookingRepository;

    /**
     * Chạy mỗi 5 phút để kiểm tra và hủy các booking quá hạn check-in
     */
    @Scheduled(cron = "0 */5 * * * *") // Chạy mỗi 5 phút
    @Transactional
    public void autoCancelExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();
        
        log.debug("Running auto-cancel job at {}", now);
        
        // Tìm các booking đã qua deadline check-in mà chưa check-in
        // Status: PAYMENT_CONFIRMED hoặc CONFIRMED
        List<Booking> expiredBookings = bookingRepository.findAll().stream()
            .filter(b -> {
                // Chỉ xử lý booking có status PAYMENT_CONFIRMED hoặc CONFIRMED
                if (!"PAYMENT_CONFIRMED".equals(b.getStatus()) && !"CONFIRMED".equals(b.getStatus())) {
                    return false;
                }
                
                // Phải có check-in deadline
                if (b.getCheckInDeadline() == null) {
                    return false;
                }
                
                // Đã qua deadline
                if (!now.isAfter(b.getCheckInDeadline())) {
                    return false;
                }
                
                // Chưa check-in
                return b.getCheckedInAt() == null;
            })
            .toList();
        
        if (expiredBookings.isEmpty()) {
            log.debug("No expired bookings found");
            return;
        }
        
        log.info("Found {} expired bookings to cancel", expiredBookings.size());
        
        for (Booking booking : expiredBookings) {
            try {
                log.info("Auto-cancelling booking {} - No check-in after deadline {}", 
                    booking.getId(), booking.getCheckInDeadline());
                
                booking.setStatus("NO_SHOW");
                booking.setCancelledAt(now);
                booking.setCancelledBy("SYSTEM");
                
                String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
                booking.setNotes(currentNotes + 
                    " | [AUTO-CANCEL] Không check-in sau 20 phút. Deadline: " + 
                    booking.getCheckInDeadline());
                
                bookingRepository.save(booking);
                
                log.info("Successfully cancelled booking {}", booking.getId());
                
                // TODO: Gửi notification cho user
                // TODO: Xử lý refund policy (có thể giữ deposit hoặc refund 50%)
                
            } catch (Exception e) {
                log.error("Error cancelling booking {}: {}", booking.getId(), e.getMessage(), e);
            }
        }
        
        log.info("Auto-cancel job completed. Cancelled {} bookings", expiredBookings.size());
    }
}
