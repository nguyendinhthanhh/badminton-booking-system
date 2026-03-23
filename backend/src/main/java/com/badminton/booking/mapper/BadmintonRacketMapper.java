package com.badminton.booking.mapper;

import com.badminton.booking.dto.request.BadmintonRacketCreateRequest;
import com.badminton.booking.dto.request.BadmintonRacketUpdateRequest;
import com.badminton.booking.dto.response.BadmintonRacketResponse;
import com.badminton.booking.entity.BadmintonRacket;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BadmintonRacketMapper {

    BadmintonRacketResponse toResponse(BadmintonRacket badmintonRacket);

    BadmintonRacket toEntity(BadmintonRacketCreateRequest request);

    void updateEntityFromRequest(BadmintonRacketUpdateRequest request, @MappingTarget BadmintonRacket badmintonRacket);
}
