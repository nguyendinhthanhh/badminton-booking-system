package com.badminton.booking.service;

import com.badminton.booking.dto.request.TimeSlotRequest;
import com.badminton.booking.dto.response.TimeSlotResponse;

import java.util.List;

public interface TimeSlotService {

    TimeSlotResponse createTimeSlot(TimeSlotRequest request);

    TimeSlotResponse updateTimeSlot(Integer id, TimeSlotRequest request);

    void deleteTimeSlot(Integer id);

    TimeSlotResponse getTimeSlotById(Integer id);

    List<TimeSlotResponse> getAllTimeSlots();

    List<TimeSlotResponse> getActiveTimeSlots();

    /**
     * Tạo các khung giờ mặc định cho hệ thống
     */
    List<TimeSlotResponse> createDefaultTimeSlots();
}
