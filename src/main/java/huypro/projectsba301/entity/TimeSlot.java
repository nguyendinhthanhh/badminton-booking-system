package huypro.projectsba301.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "TIME_SLOTS")
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slot_id", nullable = false)
    private Integer id;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "period_name", length = 100)
    private String periodName;

    @OneToMany(mappedBy = "slot")
    private Set<BookingDetail> bookingDetails = new LinkedHashSet<>();

    @OneToMany(mappedBy = "slot")
    private Set<PriceRule> priceRules = new LinkedHashSet<>();

}