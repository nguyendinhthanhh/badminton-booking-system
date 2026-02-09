package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bookings_id_gen")
    @SequenceGenerator(name = "bookings_id_gen", sequenceName = "bookings_booking_id_seq", allocationSize = 1)
    @Column(name = "booking_id", nullable = false)
    private Integer id;

    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @Column(name = "play_date")
    private LocalDate playDate;

    // ===== THỜI GIAN CHƠI =====
    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "actual_end_time")
    private LocalTime actualEndTime;

    @Column(name = "buffer_minutes")
    private Integer bufferMinutes = 10;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "max_duration_minutes")
    private Integer maxDurationMinutes;  // Thời gian tối đa có thể chơi (cho walk-in open-ended)

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes = 0;

    @Column(name = "overtime_fee", precision = 10, scale = 2)
    private BigDecimal overtimeFee = BigDecimal.ZERO;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    // ===== DEPOSIT & PAYMENT =====
    @Column(name = "deposit_amount", precision = 10, scale = 2)
    private BigDecimal depositAmount; // Số tiền cọc (1/3 tổng tiền)

    @Column(name = "deposit_paid", precision = 10, scale = 2)
    private BigDecimal depositPaid = BigDecimal.ZERO; // Số tiền đã cọc

    @Column(name = "remaining_amount", precision = 10, scale = 2)
    private BigDecimal remainingAmount; // Số tiền còn lại phải trả

    @Column(name = "deposit_required")
    private Boolean depositRequired = true; // Có yêu cầu cọc không

    @Column(name = "check_in_deadline")
    private LocalDateTime checkInDeadline; // Deadline check-in (startTime + 20 phút)

    @Size(max = 50)
    @Column(name = "status", length = 50)
    private String status; // PENDING, PENDING_PAYMENT, PAYMENT_CONFIRMED, CONFIRMED, PLAYING, COMPLETED, CANCELLED, NO_SHOW

    @Size(max = 50)
    @Column(name = "payment_status", length = 50)
    private String paymentStatus;

    @Column(name = "notes")
    private String notes;

    // ===== TIMESTAMPS - Thời điểm các sự kiện =====
    @Column(name = "created_at")
    private LocalDateTime createdAt; // Thời điểm tạo booking

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt; // Thời điểm admin xác nhận

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt; // Thời điểm check-in

    @Column(name = "completed_at")
    private LocalDateTime completedAt; // Thời điểm hoàn thành

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt; // Thời điểm hủy

    @Column(name = "cancelled_by")
    private String cancelledBy; // USER hoặc ADMIN

    // ===== BOOKING TYPE & GUEST INFO =====
    @Size(max = 20)
    @Column(name = "booking_type", length = 20)
    private String bookingType; // ONLINE, WALK_IN

    @Column(name = "open_ended")
    private Boolean openEnded = false; // true = chưa xác định giờ kết thúc

    @Size(max = 100)
    @Column(name = "guest_name", length = 100)
    private String guestName; // Tên khách vãng lai (nếu không có user)

    @Size(max = 20)
    @Column(name = "guest_phone", length = 20)
    private String guestPhone; // SĐT khách vãng lai

    @Size(max = 50)
    @Column(name = "created_by", length = 50)
    private String createdBy; // Username của admin tạo booking (cho walk-in)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id")
    private BadmintonCourt court;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "booking")
    private Set<BookingDetail> bookingDetails = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BookingPriceBreakdown> priceBreakdowns = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BookingExtension> extensions = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<CheckInLog> checkInLogs = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<Order> orders = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<Payment> payments = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<Review> reviews = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<RacketRental> racketRentals = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<LockerRental> lockerRentals = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<Notification> notifications = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<Refund> refunds = new LinkedHashSet<>();

    @OneToMany(mappedBy = "booking")
    private Set<CoachBooking> coachBookings = new LinkedHashSet<>();

    // ===== Helper methods =====
    public int getDurationMinutes() {
        if (startTime == null)
            return 0;
        if (endTime == null) {
            return estimatedDurationMinutes != null ? estimatedDurationMinutes : 0;
        }
        return (int) java.time.Duration.between(startTime, endTime).toMinutes();
    }

    public LocalTime getEffectiveEndTime() {
        LocalTime effectiveEnd = endTime;
        if (effectiveEnd == null) {
            // Nếu endTime null (open-ended), tính effective end dựa trên estimated duration
            if (estimatedDurationMinutes != null && startTime != null) {
                effectiveEnd = startTime.plusMinutes(estimatedDurationMinutes);
            } else {
                return null; // Không thể xác định
            }
        }
        int buffer = (bufferMinutes != null) ? bufferMinutes : 0;
        return effectiveEnd.plusMinutes(buffer);
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (bookingDate == null) {
            bookingDate = LocalDate.now();
        }
        // Ensure bookingType is set for legacy records or omitted values.
        // If createdBy (admin) is present, assume WALK_IN; if user present, assume ONLINE.
        if (bookingType == null || bookingType.isBlank()) {
            if (createdBy != null && !createdBy.isBlank()) {
                bookingType = "WALK_IN";
            } else if (user != null) {
                bookingType = "ONLINE";
            } else {
                // Fallback: treat as WALK_IN (guest created at front desk)
                bookingType = "WALK_IN";
            }
        }
    }
}