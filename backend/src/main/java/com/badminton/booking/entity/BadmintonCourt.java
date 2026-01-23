package com.badminton.booking.entity;

import com.badminton.booking.entity.enums.CourtStatus;
import com.badminton.booking.entity.enums.CourtType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "badminton_courts")
public class BadmintonCourt  {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "badminton_courts_id_gen")
    @SequenceGenerator(name = "badminton_courts_id_gen", sequenceName = "badminton_courts_court_id_seq", allocationSize = 1)
    @Column(name = "court_id", nullable = false)
    private Integer id;

    @Size(max = 100)
    @Column(name = "name", length = 100)
    private String name;


    @Column(name = "status", length = 50)
    @Enumerated(EnumType.STRING)
    private CourtStatus status;


    @Column(name = "type", length = 50)
    private CourtType type;

    @Size(max = 255)
    @Column(name = "location", length = 255)
    private String location;

    @Lob
    @Column(name = "description")
    private String description;

    @Size(max = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "court")
    private Set<Booking> bookings = new LinkedHashSet<>();

    @OneToMany(mappedBy = "court")
    private Set<PriceRule> priceRules = new LinkedHashSet<>();

}