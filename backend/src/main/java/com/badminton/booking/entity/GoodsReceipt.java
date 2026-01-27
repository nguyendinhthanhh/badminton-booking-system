package com.badminton.booking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "goods_receipts")
public class GoodsReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "gr_id_gen")
    @SequenceGenerator(name = "gr_id_gen", sequenceName = "goods_receipts_id_seq", allocationSize = 1)
    @Column(name = "receipt_id", nullable = false)
    private Integer id;

    @Column(name = "receipt_code", length = 50, unique = true)
    private String receiptCode;

    @Column(name = "receipt_date")
    private LocalDateTime receiptDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "note")
    private String note;

    @Column(name = "total_price")
    private Double totalPrice;

    @OneToMany(mappedBy = "goodsReceipt", cascade = CascadeType.ALL)
    private Set<GoodsReceiptItem> items = new LinkedHashSet<>();
    }
