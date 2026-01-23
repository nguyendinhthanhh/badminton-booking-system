package com.badminton.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notifications_id_gen")
    @SequenceGenerator(name = "notifications_id_gen", sequenceName = "notifications_id_seq", allocationSize = 1)
    @Column(name = "notification_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Column(name = "title", length = 255)
    private String title;

    @Lob
    @Column(name = "message")
    private String message;

    @Size(max = 50)
    @Column(name = "type", length = 50)
    private String type;

    @ColumnDefault("false")
    @Column(name = "is_read")
    private Boolean isRead;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

}
