package com.badminton.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "system_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {

    @Id
    @Column(name = "config_key", nullable = false, unique = true)
    private String configKey;

    @Column(name = "config_value")
    private String configValue;

    @Column(name = "description")
    private String description;
}
