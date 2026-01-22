package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "badminton_courts")
public class BadmintonCourt {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "badminton_courts_id_gen")
    @SequenceGenerator(name = "badminton_courts_id_gen", sequenceName = "badminton_courts_court_id_seq", allocationSize = 1)
    @Column(name = "court_id", nullable = false)
    private Integer id;

    @Size(max = 100)
    @Column(name = "name", length = 100)
    private String name;

    @Size(max = 50)
    @Column(name = "status", length = 50)
    private String status;

    @Size(max = 50)
    @Column(name = "type", length = 50)
    private String type;

    @OneToMany(mappedBy = "court")
    private Set<Booking> bookings = new LinkedHashSet<>();

    @OneToMany(mappedBy = "court")
    private Set<PriceRule> priceRules = new LinkedHashSet<>();

}