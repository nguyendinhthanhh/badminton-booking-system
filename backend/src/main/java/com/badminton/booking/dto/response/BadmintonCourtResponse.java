package com.badminton.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadmintonCourtResponse {

    private Integer id;
    private String name;
    private String status;
    private String type;
    private String location;
    private String description;
    private String imageUrl;
    private Integer capacity;

}
