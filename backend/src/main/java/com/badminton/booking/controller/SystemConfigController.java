package com.badminton.booking.controller;

import com.badminton.booking.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/config")
@RequiredArgsConstructor
@Tag(name = "System Configuration", description = "Admin APIs for system settings")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class SystemConfigController {

    private final SystemConfigService configService;

    @GetMapping
    @Operation(summary = "Get all system configurations")
    public ResponseEntity<Map<String, String>> getAllConfigs() {
        return ResponseEntity.ok(configService.getAllConfigs());
    }

    @PostMapping
    @Operation(summary = "Update system configurations")
    public ResponseEntity<Void> updateConfigs(@RequestBody Map<String, String> configs) {
        configService.updateConfigs(configs);
        return ResponseEntity.ok().build();
    }
}
