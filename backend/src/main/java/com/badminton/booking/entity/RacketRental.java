package com.badminton.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "racket_rentals")
public class RacketRental {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "racket_rentals_id_gen")
    @SequenceGenerator(name = "racket_rentals_id_gen", sequenceName = "racket_rentals_id_seq", allocationSize = 1)
    @Column(name = "rental_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "racket_id")
    private BadmintonRacket racket;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "rental_fee", precision = 10, scale = 2)
    private BigDecimal rentalFee;

    @Column(name = "rental_start")
    private LocalDateTime rentalStart;

    @Column(name = "rental_end")
    private LocalDateTime rentalEnd;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(name = "status", length = 50)
    private String status;

}
