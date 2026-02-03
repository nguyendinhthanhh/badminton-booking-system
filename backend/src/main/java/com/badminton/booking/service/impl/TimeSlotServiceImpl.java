package com.badminton.booking.service.impl;

import com.badminton.booking.dto.request.TimeSlotRequest;
import com.badminton.booking.dto.response.TimeSlotResponse;
import com.badminton.booking.entity.TimeSlot;
import com.badminton.booking.exception.ResourceNotFoundException;
import com.badminton.booking.mapper.TimeSlotMapper;
import com.badminton.booking.repository.TimeSlotRepository;
import com.badminton.booking.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final TimeSlotMapper timeSlotMapper;

    @Override
    @Transactional
    public TimeSlotResponse createTimeSlot(TimeSlotRequest request) {
        TimeSlot timeSlot = timeSlotMapper.toEntity(request);
        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return timeSlotMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TimeSlotResponse updateTimeSlot(Integer id, TimeSlotRequest request) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with id: " + id));
        timeSlotMapper.updateEntity(timeSlot, request);
        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return timeSlotMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteTimeSlot(Integer id) {
        if (!timeSlotRepository.existsById(id)) {
            throw new ResourceNotFoundException("TimeSlot not found with id: " + id);
        }
        timeSlotRepository.deleteById(id);
    }

    @Override
    public TimeSlotResponse getTimeSlotById(Integer id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with id: " + id));
        return timeSlotMapper.toResponse(timeSlot);
    }

    @Override
    public List<TimeSlotResponse> getAllTimeSlots() {
        return timeSlotRepository.findAll().stream()
                .map(timeSlotMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TimeSlotResponse> getActiveTimeSlots() {
        return timeSlotRepository.findByIsActiveTrueOrderByStartTimeAsc().stream()
                .map(timeSlotMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<TimeSlotResponse> createDefaultTimeSlots() {
        List<TimeSlot> defaultSlots = new ArrayList<>();

        // Sáng sớm (6h-8h)
        defaultSlots.add(createSlot(LocalTime.of(6, 0), LocalTime.of(7, 0), "Sáng sớm"));
        defaultSlots.add(createSlot(LocalTime.of(7, 0), LocalTime.of(8, 0), "Sáng sớm"));

        // Sáng (8h-11h)
        defaultSlots.add(createSlot(LocalTime.of(8, 0), LocalTime.of(9, 0), "Sáng"));
        defaultSlots.add(createSlot(LocalTime.of(9, 0), LocalTime.of(10, 0), "Sáng"));
        defaultSlots.add(createSlot(LocalTime.of(10, 0), LocalTime.of(11, 0), "Sáng"));

        // Trưa (11h-13h)
        defaultSlots.add(createSlot(LocalTime.of(11, 0), LocalTime.of(12, 0), "Trưa"));
        defaultSlots.add(createSlot(LocalTime.of(12, 0), LocalTime.of(13, 0), "Trưa"));

        // Chiều (13h-17h)
        defaultSlots.add(createSlot(LocalTime.of(13, 0), LocalTime.of(14, 0), "Chiều"));
        defaultSlots.add(createSlot(LocalTime.of(14, 0), LocalTime.of(15, 0), "Chiều"));
        defaultSlots.add(createSlot(LocalTime.of(15, 0), LocalTime.of(16, 0), "Chiều"));
        defaultSlots.add(createSlot(LocalTime.of(16, 0), LocalTime.of(17, 0), "Chiều"));

        // Giờ vàng (17h-21h)
        defaultSlots.add(createSlot(LocalTime.of(17, 0), LocalTime.of(18, 0), "Giờ vàng"));
        defaultSlots.add(createSlot(LocalTime.of(18, 0), LocalTime.of(19, 0), "Giờ vàng"));
        defaultSlots.add(createSlot(LocalTime.of(19, 0), LocalTime.of(20, 0), "Giờ vàng"));
        defaultSlots.add(createSlot(LocalTime.of(20, 0), LocalTime.of(21, 0), "Giờ vàng"));

        // Tối muộn (21h-22h)
        defaultSlots.add(createSlot(LocalTime.of(21, 0), LocalTime.of(22, 0), "Tối muộn"));

        List<TimeSlot> savedSlots = timeSlotRepository.saveAll(defaultSlots);
        return savedSlots.stream()
                .map(timeSlotMapper::toResponse)
                .collect(Collectors.toList());
    }

    private TimeSlot createSlot(LocalTime start, LocalTime end, String periodName) {
        TimeSlot slot = new TimeSlot();
        slot.setStartTime(start);
        slot.setEndTime(end);
        slot.setPeriodName(periodName);
        slot.setIsActive(true);
        return slot;
    }
}
