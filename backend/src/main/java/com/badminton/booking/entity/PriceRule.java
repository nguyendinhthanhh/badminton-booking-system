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

    @Column(name = "day_of_week")
    private Integer dayOfWeek;

    @Column(name = "effective_from")
    private java.time.LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private java.time.LocalDate effectiveTo;

    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id")
    private BadmintonCourt court;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private TimeSlot slot;

}