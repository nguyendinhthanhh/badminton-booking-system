package com.badminton.booking.mapper;

import com.badminton.booking.dto.request.TimeSlotRequest;
import com.badminton.booking.dto.response.TimeSlotResponse;
import com.badminton.booking.entity.TimeSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TimeSlotMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookingDetails", ignore = true)
    TimeSlot toEntity(TimeSlotRequest request);

    TimeSlotResponse toResponse(TimeSlot timeSlot);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookingDetails", ignore = true)
    void updateEntity(@MappingTarget TimeSlot timeSlot, TimeSlotRequest request);
}
