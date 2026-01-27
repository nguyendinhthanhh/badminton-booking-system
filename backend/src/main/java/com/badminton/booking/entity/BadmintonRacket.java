package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "badminton_rackets")
public class BadmintonRacket {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "badminton_rackets_id_gen")
    @SequenceGenerator(name = "badminton_rackets_id_gen", sequenceName = "badminton_rackets_racket_id_seq", allocationSize = 1)
    @Column(name = "racket_id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @Column(name = "racket_code", length = 50, unique = true)
    private String racketCode;

    @Size(max = 100)
    @Column(name = "brand", length = 100)
    private String brand;

    @Size(max = 100)
    @Column(name = "model", length = 100)
    private String model;

    @Size(max = 50)
    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "rental_price", precision = 10, scale = 2)
    private BigDecimal rentalPrice;

    @Size(max = 50)
    @Column(name = "condition_status", length = 50)
    private String conditionStatus;

    @Lob
    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "racket")
    private Set<RacketRental> racketRentals = new LinkedHashSet<>();

}