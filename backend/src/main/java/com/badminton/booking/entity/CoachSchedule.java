package com.badminton.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "coach_schedules")
public class CoachSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "coach_schedules_id_gen")
    @SequenceGenerator(name = "coach_schedules_id_gen", sequenceName = "coach_schedules_id_seq", allocationSize = 1)
    @Column(name = "schedule_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id")
    private Coach coach;

    @Column(name = "day_of_week")
    private Integer dayOfWeek;

    @Column(name = "specific_date")
    private LocalDate specificDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @Lob
    @Column(name = "note")
    private String note;

}
