package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "check_in_logs")
public class CheckInLog {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "check_in_logs_id_gen")
    @SequenceGenerator(name = "check_in_logs_id_gen", sequenceName = "check_in_logs_log_id_seq", allocationSize = 1)
    @Column(name = "log_id", nullable = false)
    private Integer id;

    @Column(name = "check_in_time")
    private Instant checkInTime;

    @Column(name = "check_out_time")
    private Instant checkOutTime;

    @Size(max = 50)
    @Column(name = "method", length = 50)
    private String method;

    @Lob
    @Column(name = "note")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;

}