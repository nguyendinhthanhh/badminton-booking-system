package com.badminton.booking.entity;

import com.badminton.booking.entity.enums.DayType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * Bảng giá sân theo khung giờ và loại ngày
 *
 * Ví dụ:
 * - Sân 1, WEEKDAY, 06:00-16:00: 70,000đ/h
 * - Sân 1, WEEKDAY, 16:00-22:00: 100,000đ/h (giờ vàng)
 * - Sân 1, WEEKEND, 06:00-22:00: 120,000đ/h
 */
@Getter
@Setter
@Entity
@Table(name = "court_prices", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"court_id", "day_type", "start_time", "end_time"})
})
public class CourtPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private BadmintonCourt court;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", nullable = false, length = 20)
    private DayType dayType; // WEEKDAY, WEEKEND, HOLIDAY

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "price_per_hour", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerHour;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

