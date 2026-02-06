package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    // ===== THAY ĐỔI CHÍNH: Dùng startTime-endTime thay vì slot =====
    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "actual_end_time")
    private LocalTime actualEndTime;

    @Column(name = "buffer_minutes")
    private Integer bufferMinutes = 10;

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes = 0;

    @Column(name = "overtime_fee", precision = 10, scale = 2)
    private BigDecimal overtimeFee = BigDecimal.ZERO;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Size(max = 50)
    @Column(name = "status", length = 50)
    private String status; // PENDING, CONFIRMED, PLAYING, COMPLETED, CANCELLED, NO_SHOW

    @Size(max = 50)
    @Column(name = "payment_status", length = 50)
    private String paymentStatus;

    @Column(name = "notes")
    private String notes;

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
        if (startTime == null || endTime == null) return 0;
        return (int) java.time.Duration.between(startTime, endTime).toMinutes();
    }

    public LocalTime getEffectiveEndTime() {
        // End time bao gồm buffer
        if (endTime == null) return null;

        // Ensure bufferMinutes is not null, use default 0 if null
        int buffer = (bufferMinutes != null) ? bufferMinutes : 0;

        return endTime.plusMinutes(buffer);
    }
}