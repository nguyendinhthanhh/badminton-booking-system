package com.badminton.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entity lưu các slot được release sớm từ booking
 * Khi khách check-out sớm, thời gian còn dư sẽ được tạo thành slot mới
 * để người khác có thể đặt
 */
@Getter
@Setter
@Entity
@Table(name = "released_slots")
public class ReleasedSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "released_slots_id_gen")
    @SequenceGenerator(name = "released_slots_id_gen", sequenceName = "released_slots_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private BadmintonCourt court;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_booking_id", nullable = false)
    private Booking sourceBooking;

    @Column(name = "play_date", nullable = false)
    private LocalDate playDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "type", length = 50)
    private String type = "EARLY_RELEASE";  // EARLY_RELEASE, CANCELLED, etc.

    @Column(name = "status", length = 50)
    private String status = "AVAILABLE";  // AVAILABLE, BOOKED, EXPIRED

    // Booking mới nếu slot này được đặt lại
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_booking_id")
    private Booking newBooking;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;

    @Column(name = "released_by")
    private String releasedBy;  // Username của admin thực hiện

    @Column(name = "notes")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (releasedAt == null) {
            releasedAt = LocalDateTime.now();
        }
        if (startTime != null && endTime != null) {
            durationMinutes = (int) java.time.Duration.between(startTime, endTime).toMinutes();
        }
    }
}

