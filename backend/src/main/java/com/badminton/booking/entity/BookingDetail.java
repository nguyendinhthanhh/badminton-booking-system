package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "booking_details")
public class BookingDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "booking_details_id_gen")
    @SequenceGenerator(name = "booking_details_id_gen", sequenceName = "booking_details_detail_id_seq", allocationSize = 1)
    @Column(name = "detail_id", nullable = false)
    private Integer id;

    @Column(name = "price_at_booking", precision = 10, scale = 2)
    private BigDecimal priceAtBooking;

    @Size(max = 50)
    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "actual_start_time")
    private java.time.LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private java.time.LocalDateTime actualEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private TimeSlot slot;

}