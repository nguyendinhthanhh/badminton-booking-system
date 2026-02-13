package com.badminton.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class WarehouseOptionResponse {
    private Integer id;
    private String name;
    private String address;
}
