package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "time_slots")
public class TimeSlot  {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "time_slots_id_gen")
    @SequenceGenerator(name = "time_slots_id_gen", sequenceName = "time_slots_slot_id_seq", allocationSize = 1)
    @Column(name = "slot_id", nullable = false)
    private Integer id;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Size(max = 100)
    @Column(name = "period_name", length = 100)
    private String periodName; // "Sáng sớm", "Sáng", "Trưa", "Chiều", "Tối", "Giờ vàng"

    @Column(name = "is_active")
    private Boolean isActive;

    @OneToMany(mappedBy = "slot")
    private Set<BookingDetail> bookingDetails = new LinkedHashSet<>();

    @PrePersist
    protected void onCreate() {
        if (isActive == null) {
            isActive = true;
        }
    }
}