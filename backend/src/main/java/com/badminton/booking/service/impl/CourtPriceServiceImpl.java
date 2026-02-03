package com.badminton.booking.service.impl;

import com.badminton.booking.dto.request.CourtPriceRequest;
import com.badminton.booking.dto.response.CourtPriceResponse;
import com.badminton.booking.entity.BadmintonCourt;
import com.badminton.booking.entity.CourtPrice;
import com.badminton.booking.entity.enums.DayType;
import com.badminton.booking.exception.ResourceNotFoundException;
import com.badminton.booking.mapper.CourtPriceMapper;
import com.badminton.booking.repository.BadmintonCourtRepo;
import com.badminton.booking.repository.CourtPriceRepository;
import com.badminton.booking.service.CourtPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourtPriceServiceImpl implements CourtPriceService {

    private final CourtPriceRepository courtPriceRepository;
    private final BadmintonCourtRepo badmintonCourtRepo;
    private final CourtPriceMapper courtPriceMapper;

    @Override
    @Transactional
    public CourtPriceResponse createPrice(CourtPriceRequest request) {
        // Validate court exists
        BadmintonCourt court = badmintonCourtRepo.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found with id: " + request.getCourtId()));

        // Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());

        // Check for overlapping prices
        List<CourtPrice> overlapping = courtPriceRepository.findOverlappingPrices(
                request.getCourtId(), request.getDayType(), request.getStartTime(), request.getEndTime());
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Price already exists for this time range. Please update or delete the existing price first.");
        }

        CourtPrice courtPrice = courtPriceMapper.toEntity(request);
        courtPrice.setCourt(court);

        CourtPrice saved = courtPriceRepository.save(courtPrice);
        return courtPriceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CourtPriceResponse updatePrice(Integer id, CourtPriceRequest request) {
        CourtPrice courtPrice = courtPriceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Price not found with id: " + id));

        // Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());

        // Check for overlapping prices (excluding current)
        List<CourtPrice> overlapping = courtPriceRepository.findOverlappingPrices(
                request.getCourtId(), request.getDayType(), request.getStartTime(), request.getEndTime());
        overlapping.removeIf(p -> p.getId().equals(id));
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Price already exists for this time range.");
        }

        // Update court if changed
        if (!courtPrice.getCourt().getId().equals(request.getCourtId())) {
            BadmintonCourt court = badmintonCourtRepo.findById(request.getCourtId())
                    .orElseThrow(() -> new ResourceNotFoundException("Court not found with id: " + request.getCourtId()));
            courtPrice.setCourt(court);
        }

        courtPriceMapper.updateEntity(courtPrice, request);
        CourtPrice saved = courtPriceRepository.save(courtPrice);
        return courtPriceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deletePrice(Integer id) {
        if (!courtPriceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Price not found with id: " + id);
        }
        courtPriceRepository.deleteById(id);
    }

    @Override
    public CourtPriceResponse getPriceById(Integer id) {
        CourtPrice courtPrice = courtPriceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Price not found with id: " + id));
        return courtPriceMapper.toResponse(courtPrice);
    }

    @Override
    public List<CourtPriceResponse> getPricesByCourtId(Integer courtId) {
        if (!badmintonCourtRepo.existsById(courtId)) {
            throw new ResourceNotFoundException("Court not found with id: " + courtId);
        }
        return courtPriceRepository.findByCourtId(courtId).stream()
                .map(courtPriceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourtPriceResponse> getPricesByCourtIdAndDayType(Integer courtId, DayType dayType) {
        if (!badmintonCourtRepo.existsById(courtId)) {
            throw new ResourceNotFoundException("Court not found with id: " + courtId);
        }
        return courtPriceRepository.findByCourtIdAndDayType(courtId, dayType).stream()
                .map(courtPriceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BigDecimal getPriceForTime(Integer courtId, LocalDate date, LocalTime time) {
        DayType dayType = getDayType(date);

        return courtPriceRepository.findPriceForTime(courtId, dayType, time)
                .map(CourtPrice::getPricePerHour)
                .orElse(null); // Trả về null nếu chưa cấu hình giá
    }

    @Override
    @Transactional
    public List<CourtPriceResponse> createDefaultPricesForCourt(Integer courtId) {
        BadmintonCourt court = badmintonCourtRepo.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found with id: " + courtId));

        List<CourtPrice> prices = new ArrayList<>();

        // WEEKDAY prices
        // Sáng sớm: 06:00-08:00 - Giá thấp
        prices.add(createPriceEntity(court, DayType.WEEKDAY, LocalTime.of(6, 0), LocalTime.of(8, 0), new BigDecimal("60000")));
        // Sáng: 08:00-11:00 - Giá bình thường
        prices.add(createPriceEntity(court, DayType.WEEKDAY, LocalTime.of(8, 0), LocalTime.of(11, 0), new BigDecimal("80000")));
        // Trưa: 11:00-14:00 - Giá thấp
        prices.add(createPriceEntity(court, DayType.WEEKDAY, LocalTime.of(11, 0), LocalTime.of(14, 0), new BigDecimal("60000")));
        // Chiều: 14:00-17:00 - Giá bình thường
        prices.add(createPriceEntity(court, DayType.WEEKDAY, LocalTime.of(14, 0), LocalTime.of(17, 0), new BigDecimal("80000")));
        // Giờ vàng: 17:00-21:00 - Giá cao
        prices.add(createPriceEntity(court, DayType.WEEKDAY, LocalTime.of(17, 0), LocalTime.of(21, 0), new BigDecimal("120000")));
        // Tối muộn: 21:00-22:00 - Giá bình thường
        prices.add(createPriceEntity(court, DayType.WEEKDAY, LocalTime.of(21, 0), LocalTime.of(22, 0), new BigDecimal("80000")));

        // WEEKEND prices - Cao hơn ngày thường
        prices.add(createPriceEntity(court, DayType.WEEKEND, LocalTime.of(6, 0), LocalTime.of(8, 0), new BigDecimal("80000")));
        prices.add(createPriceEntity(court, DayType.WEEKEND, LocalTime.of(8, 0), LocalTime.of(11, 0), new BigDecimal("100000")));
        prices.add(createPriceEntity(court, DayType.WEEKEND, LocalTime.of(11, 0), LocalTime.of(14, 0), new BigDecimal("80000")));
        prices.add(createPriceEntity(court, DayType.WEEKEND, LocalTime.of(14, 0), LocalTime.of(17, 0), new BigDecimal("100000")));
        prices.add(createPriceEntity(court, DayType.WEEKEND, LocalTime.of(17, 0), LocalTime.of(21, 0), new BigDecimal("150000")));
        prices.add(createPriceEntity(court, DayType.WEEKEND, LocalTime.of(21, 0), LocalTime.of(22, 0), new BigDecimal("100000")));

        List<CourtPrice> savedPrices = courtPriceRepository.saveAll(prices);
        return savedPrices.stream()
                .map(courtPriceMapper::toResponse)
                .collect(Collectors.toList());
    }

    private CourtPrice createPriceEntity(BadmintonCourt court, DayType dayType,
            LocalTime startTime, LocalTime endTime, BigDecimal price) {
        CourtPrice cp = new CourtPrice();
        cp.setCourt(court);
        cp.setDayType(dayType);
        cp.setStartTime(startTime);
        cp.setEndTime(endTime);
        cp.setPricePerHour(price);
        cp.setIsActive(true);
        return cp;
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private DayType getDayType(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return DayType.WEEKEND;
        }
        return DayType.WEEKDAY;
    }
}

