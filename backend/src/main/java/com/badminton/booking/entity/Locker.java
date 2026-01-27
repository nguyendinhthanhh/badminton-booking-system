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
@Table(name = "lockers")
public class Locker {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lockers_id_gen")
    @SequenceGenerator(name = "lockers_id_gen", sequenceName = "lockers_id_seq", allocationSize = 1)
    @Column(name = "locker_id", nullable = false)
    private Integer id;

    @Size(max = 50)
    @Column(name = "locker_number", length = 50, unique = true)
    private String lockerNumber;

    @Size(max = 50)
    @Column(name = "size", length = 50)
    private String size;

    @Size(max = 50)
    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "rental_price", precision = 10, scale = 2)
    private BigDecimal rentalPrice;

    @Size(max = 255)
    @Column(name = "location", length = 255)
    private String location;

    @Lob
    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "locker")
    private Set<LockerRental> lockerRentals = new LinkedHashSet<>();

}
