package huypro.projectsba301.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "WAREHOUSES")
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warehouse_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(name = "name", length = 150)
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "type", length = 50)
    private String type;

    @OneToMany(mappedBy = "warehouse")
    private Set<Inventory> inventories = new LinkedHashSet<>();

}