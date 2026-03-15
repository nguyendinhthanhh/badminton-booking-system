package com.badminton.booking.service.impl;

import com.badminton.booking.dto.request.BadmintonRacketCreateRequest;
import com.badminton.booking.dto.request.BadmintonRacketUpdateRequest;
import com.badminton.booking.dto.response.BadmintonRacketResponse;
import com.badminton.booking.entity.BadmintonRacket;
import com.badminton.booking.exception.ResourceNotFoundException;
import com.badminton.booking.mapper.BadmintonRacketMapper;
import com.badminton.booking.repository.BadmintonRacketRepository;
import com.badminton.booking.service.BadmintonRacketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BadmintonRacketServiceImpl implements BadmintonRacketService {

    @Autowired
    private BadmintonRacketRepository badmintonRacketRepository;

    @Autowired
    private BadmintonRacketMapper badmintonRacketMapper;

    @Override
    public BadmintonRacketResponse createRacket(BadmintonRacketCreateRequest request) {
        BadmintonRacket racket = badmintonRacketMapper.toEntity(request);
        BadmintonRacket savedRacket = badmintonRacketRepository.save(racket);
        return badmintonRacketMapper.toResponse(savedRacket);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BadmintonRacketResponse> getAllRackets(int page, int size) {
        return badmintonRacketRepository
                .findAll(PageRequest.of(page, size))
                .map(badmintonRacketMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BadmintonRacketResponse getRacketById(Integer id) {
        BadmintonRacket racket = badmintonRacketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badminton racket not found"));
        return badmintonRacketMapper.toResponse(racket);
    }

    @Override
    public BadmintonRacketResponse updateRacket(Integer id, BadmintonRacketUpdateRequest request) {
        BadmintonRacket racket = badmintonRacketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badminton racket not found"));
        badmintonRacketMapper.updateEntityFromRequest(request, racket);
        BadmintonRacket savedRacket = badmintonRacketRepository.save(racket);
        return badmintonRacketMapper.toResponse(savedRacket);
    }

    @Override
    public void deleteRacket(Integer id) {
        BadmintonRacket racket = badmintonRacketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badminton racket not found"));
        badmintonRacketRepository.delete(racket);
    }
}
