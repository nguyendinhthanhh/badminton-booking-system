package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "coaches")
public class Coach {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "coaches_id_gen")
    @SequenceGenerator(name = "coaches_id_gen", sequenceName = "coaches_coach_id_seq", allocationSize = 1)
    @Column(name = "coach_id", nullable = false)
    private Integer id;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Size(max = 100)
    @Column(name = "specialization", length = 100)
    private String specialization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "coach")
    private Set<CoachBooking> coachBookings = new LinkedHashSet<>();

    @OneToMany(mappedBy = "coach")
    private Set<CoachSchedule> coachSchedules = new LinkedHashSet<>();

}