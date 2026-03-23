package com.badminton.booking.controller;

import com.badminton.booking.dto.request.BadmintonRacketCreateRequest;
import com.badminton.booking.dto.request.BadmintonRacketUpdateRequest;
import com.badminton.booking.dto.response.BadmintonRacketResponse;
import com.badminton.booking.service.BadmintonRacketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Badminton Rackets", description = "Endpoints for managing badminton rackets")
@RestController
@RequestMapping("/api/rackets")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BadmintonRacketController {

    @Autowired
    private BadmintonRacketService badmintonRacketService;

    @Operation(summary = "Create a new badminton racket")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<BadmintonRacketResponse> createRacket(
            @Valid @RequestBody BadmintonRacketCreateRequest request) {

        BadmintonRacketResponse response = badmintonRacketService.createRacket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get all badminton rackets")
    @GetMapping
    public ResponseEntity<Page<BadmintonRacketResponse>> getAllRackets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<BadmintonRacketResponse> responses = badmintonRacketService.getAllRackets(page, size);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Get badminton racket by ID")
    @GetMapping("/{id}")
    public ResponseEntity<BadmintonRacketResponse> getRacketById(@PathVariable Integer id) {
        BadmintonRacketResponse response = badmintonRacketService.getRacketById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update badminton racket")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<BadmintonRacketResponse> updateRacket(
            @PathVariable Integer id,
            @Valid @RequestBody BadmintonRacketUpdateRequest request) {

        BadmintonRacketResponse response = badmintonRacketService.updateRacket(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete badminton racket")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Void> deleteRacket(@PathVariable Integer id) {
        badmintonRacketService.deleteRacket(id);
        return ResponseEntity.noContent().build();
    }
}
