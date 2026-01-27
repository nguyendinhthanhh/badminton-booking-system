package com.badminton.booking.controller;

import com.badminton.booking.dto.request.BadmintonCourtCreateRequest;
import com.badminton.booking.dto.request.BadmintonCourtUpdateRequest;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import com.badminton.booking.entity.BadmintonCourt;
import com.badminton.booking.service.BadmintonCourtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Badminton Courts", description = "Endpoints for managing badminton courts")
@RestController
@RequestMapping("/api/courts")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BadmintonCourtController {


    @Autowired
    private BadmintonCourtService badmintonCourtService;


    @Operation(summary = "Create Badminton Court", description = "Create a new badminton court")
    @PostMapping("/create")
    public ResponseEntity<BadmintonCourtResponse> createCourt(@Valid @RequestBody BadmintonCourtCreateRequest request) {
        BadmintonCourtResponse badmintonCourt =  badmintonCourtService.createBadmintonCourt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(badmintonCourt);
    }



    @Operation(summary = "Get Badminton Court by ID", description = "Retrieve details of a specific badminton court by its ID")
    @GetMapping("/findById/{courtId}")
    public ResponseEntity<BadmintonCourtResponse> getCourtById(@PathVariable("courtId") Integer courtId) {
        BadmintonCourtResponse response = badmintonCourtService.getBadmintonCourtById(courtId);
        return ResponseEntity.ok(response);
    }


    @Operation(summary = "Get All Badminton Courts", description = "Retrieve a paginated list of all badminton courts")
    @GetMapping("/all")
    public ResponseEntity<Page<BadmintonCourtResponse>> getAllCourts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {

        Page<BadmintonCourtResponse> responses = badmintonCourtService.getAllBadmintonCourts(page,size);

        return ResponseEntity.ok(responses);
    }



    @Operation(summary = "delete Badminton Court by ID", description = "Delete a specific badminton court by its ID")
    @DeleteMapping("/deleteById/{courtId}")
    public ResponseEntity<String> deleteCourtById(@PathVariable("courtId") Integer court){
        badmintonCourtService.deleteBadmintonCourtById(court);
        return ResponseEntity.noContent().build();
    }


    @Operation(summary = "update Badminton Court by ID", description = "Update a specific badminton court by its ID")
    @PutMapping("/updateById/{courtId}")
    public ResponseEntity<String> updateCourtById(@PathVariable("courtId") Integer court, @Valid @RequestBody BadmintonCourtUpdateRequest request){
        badmintonCourtService.updateBadmintonCourt(court , request);
        return ResponseEntity.noContent().build();
    }



}
