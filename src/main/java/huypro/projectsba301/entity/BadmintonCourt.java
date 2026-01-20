package huypro.projectsba301.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "BADMINTON_COURTS")
public class BadmintonCourt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "court_id", nullable = false)
    private Integer id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "status", length = 50)
    private String status;

    @OneToMany(mappedBy = "court")
    private Set<Booking> bookings = new LinkedHashSet<>();

    @OneToMany(mappedBy = "court")
    private Set<PriceRule> priceRules = new LinkedHashSet<>();

}