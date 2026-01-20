package huypro.projectsba301.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "BADMINTON_RACKETS")
public class BadmintonRacket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "racket_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "material", length = 100)
    private String material;

}