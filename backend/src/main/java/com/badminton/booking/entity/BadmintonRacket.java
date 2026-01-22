package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

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
    @Column(name = "color", length = 50)
    private String color;

    @Size(max = 100)
    @Column(name = "material", length = 100)
    private String material;

    @Size(max = 100)
    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

}