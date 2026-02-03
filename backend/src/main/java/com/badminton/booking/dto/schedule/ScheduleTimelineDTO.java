package com.badminton.booking.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleTimelineDTO {
    private LocalDate date;
    private LocalTime operatingStartTime;
    private LocalTime operatingEndTime;
    private List<CourtTimelineDTO> courts;
    private ScheduleStatisticsDTO statistics;
}

