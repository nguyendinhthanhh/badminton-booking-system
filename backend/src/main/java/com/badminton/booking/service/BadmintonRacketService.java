package com.badminton.booking.service;

import com.badminton.booking.dto.request.BadmintonRacketCreateRequest;
import com.badminton.booking.dto.request.BadmintonRacketUpdateRequest;
import com.badminton.booking.dto.response.BadmintonRacketResponse;
import org.springframework.data.domain.Page;

public interface BadmintonRacketService {

    BadmintonRacketResponse createRacket(BadmintonRacketCreateRequest request);

    Page<BadmintonRacketResponse> getAllRackets(int page, int size);

    BadmintonRacketResponse getRacketById(Integer id);

    BadmintonRacketResponse updateRacket(Integer id, BadmintonRacketUpdateRequest request);

    void deleteRacket(Integer id);
}
