package com.badminton.booking.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourtTimelineDTO {
    private Integer courtId;
    private String courtName;
    private String courtType;
    private String courtStatus;
    private String location;
    private List<TimelineSlotDTO> slots;
}

