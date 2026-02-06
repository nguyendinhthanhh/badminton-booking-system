package com.badminton.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Lịch sử gia hạn booking
 */
@Getter
@Setter
@Entity
@Table(name = "booking_extensions")
public class BookingExtension {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "extension_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "original_end_time", nullable = false)
    private LocalTime originalEndTime;

    @Column(name = "extended_end_time", nullable = false)
    private LocalTime extendedEndTime;

    @Column(name = "extension_minutes", nullable = false)
    private Integer extensionMinutes;

    @Column(name = "extension_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal extensionFee;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

