package com.badminton.booking.service.serviceimpl;

import com.badminton.booking.dto.request.BadmintonCourtCreateRequest;
import com.badminton.booking.dto.request.BadmintonCourtUpdateRequest;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import com.badminton.booking.entity.BadmintonCourt;
import com.badminton.booking.entity.enums.CourtStatus;
import com.badminton.booking.mapper.BadmintonCourtMapper;
import com.badminton.booking.repository.BadmintonCourtRepo;
import com.badminton.booking.service.BadmintonCourtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class BadmintonCourtServiceImpl implements BadmintonCourtService {


    @Autowired
    private BadmintonCourtRepo badmintonCourtRepo;
    @Autowired
    private BadmintonCourtMapper badmintonCourtMapper;

    @Override
    public BadmintonCourtResponse createBadmintonCourt(BadmintonCourtCreateRequest request) {

        BadmintonCourt court = badmintonCourtMapper.toEntity(request);
        court.setStatus(CourtStatus.ACTIVE);
        court.setCreatedAt(LocalDateTime.now());
        BadmintonCourt savedCourt = badmintonCourtRepo.save(court);
        return badmintonCourtMapper.toResponse(savedCourt);
        }

    @Override
    public Page<BadmintonCourtResponse> getAllBadmintonCourts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<BadmintonCourt> badmintonCourts = badmintonCourtRepo.findAll(pageable);

        return badmintonCourts.map(badmintonCourtMapper::toResponse);
    }

    @Override
    public BadmintonCourtResponse getBadmintonCourtById(Integer id) {
        return badmintonCourtRepo.findById(id)
                .map(badmintonCourtMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Badminton court not found with id: " + id));
    }

    @Override
    public void deleteBadmintonCourtById(Integer id) {
        BadmintonCourt court = badmintonCourtRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Badminton court not found with id: " + id));
        badmintonCourtRepo.deleteById(court.getId());
    }

    @Override
    public void updateBadmintonCourt(Integer id, BadmintonCourtUpdateRequest request) {

        BadmintonCourt court = badmintonCourtRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Badminton court not found with id: " + id));
        court.setUpdatedAt(LocalDateTime.now());
        badmintonCourtMapper.updateBadmintonCourt(court, request);
        badmintonCourtRepo.save(court);
    }
}
