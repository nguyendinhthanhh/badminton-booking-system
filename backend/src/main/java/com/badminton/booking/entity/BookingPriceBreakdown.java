package com.badminton.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * Chi tiết giá booking - breakdown từng khung giờ
 * Ví dụ: Booking 07:00-10:00 sẽ có:
 * - 07:00-08:00: 60,000đ (sáng sớm)
 * - 08:00-10:00: 80,000đ x 2 = 160,000đ (sáng)
 */
@Getter
@Setter
@Entity
@Table(name = "booking_price_breakdown")
public class BookingPriceBreakdown {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "breakdown_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "price_period_start", nullable = false)
    private LocalTime periodStart;

    @Column(name = "price_period_end", nullable = false)
    private LocalTime periodEnd;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "price_per_hour", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerHour;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "day_type", nullable = false, length = 20)
    private String dayType; // WEEKDAY, WEEKEND, HOLIDAY
}

