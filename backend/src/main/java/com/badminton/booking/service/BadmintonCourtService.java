package com.badminton.booking.service;

import com.badminton.booking.dto.request.BadmintonCourtCreateRequest;
import com.badminton.booking.dto.request.BadmintonCourtUpdateRequest;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import org.springframework.data.domain.Page;



public interface BadmintonCourtService {


    BadmintonCourtResponse createBadmintonCourt(BadmintonCourtCreateRequest request);

    Page<BadmintonCourtResponse> getAllBadmintonCourts(int page, int size);

    BadmintonCourtResponse getBadmintonCourtById(Integer id);

    void deleteBadmintonCourtById(Integer id);

    void updateBadmintonCourt(Integer id, BadmintonCourtUpdateRequest request);

}
