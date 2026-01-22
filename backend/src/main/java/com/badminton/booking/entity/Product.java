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
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "products_id_gen")
    @SequenceGenerator(name = "products_id_gen", sequenceName = "products_product_id_seq", allocationSize = 1)
    @Column(name = "product_id", nullable = false)
    private Integer id;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Lob
    @Column(name = "description")
    private String description;

    @Size(max = 150)
    @Column(name = "name", length = 150)
    private String name;

    @Size(max = 100)
    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "quantity")
    private Integer quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product")
    private Set<OrderItem> orderItems = new LinkedHashSet<>();
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

}