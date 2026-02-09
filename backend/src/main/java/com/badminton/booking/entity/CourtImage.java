package com.badminton.booking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "court_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    @JsonIgnore
    private BadmintonCourt court;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
