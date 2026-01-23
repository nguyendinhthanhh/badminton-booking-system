package com.badminton.booking.mapper;

import com.badminton.booking.dto.request.BadmintonCourtCreateRequest;
import com.badminton.booking.dto.request.BadmintonCourtUpdateRequest;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import com.badminton.booking.entity.BadmintonCourt;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BadmintonCourtMapper {

    BadmintonCourt toEntity(BadmintonCourtCreateRequest badmintonCourt);

    BadmintonCourtResponse toResponse(BadmintonCourt badmintonCourt);

    //Lấy dữ liệu từ DTO → gán vào entity đang có sẵn
    void updateBadmintonCourt(@MappingTarget BadmintonCourt entity , BadmintonCourtUpdateRequest dto);

}
