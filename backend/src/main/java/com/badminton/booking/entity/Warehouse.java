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
@Table(name = "warehouses")
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "warehouses_id_gen")
    @SequenceGenerator(name = "warehouses_id_gen", sequenceName = "warehouses_warehouse_id_seq", allocationSize = 1)
    @Column(name = "warehouse_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Column(name = "address")
    private String address;

    @Size(max = 150)
    @Column(name = "name", length = 150)
    private String name;

    @Size(max = 50)
    @Column(name = "type", length = 50)
    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @OneToMany(mappedBy = "warehouse")
    private Set<Product> products = new LinkedHashSet<>();
}