package com.badminton.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "price_rules")
public class PriceRule {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "price_rules_id_gen")
    @SequenceGenerator(name = "price_rules_id_gen", sequenceName = "price_rules_rule_id_seq", allocationSize = 1)
    @Column(name = "rule_id", nullable = false)
    private Integer id;

    @Column(name = "is_weekend")
    private Boolean isWeekend;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id")
    private BadmintonCourt court;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private TimeSlot slot;

}