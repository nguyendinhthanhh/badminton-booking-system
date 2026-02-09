package com.badminton.booking.service.impl;

import com.badminton.booking.entity.SystemConfig;
import com.badminton.booking.repository.SystemConfigRepository;
import com.badminton.booking.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository configRepository;

    @Override
    @Transactional(readOnly = true)
    public String getValue(String key, String defaultValue) {
        return configRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }

    @Override
    @Transactional(readOnly = true)
    public LocalTime getTime(String key, LocalTime defaultTime) {
        String value = getValue(key, null);
        if (value == null) {
            return defaultTime;
        }
        try {
            return LocalTime.parse(value);
        } catch (DateTimeParseException e) {
            log.warn("Invalid time format for config key {}: {}. Using default.", key, value);
            return defaultTime;
        }
    }

    @Override
    @Transactional
    public void updateConfigs(Map<String, String> configs) {
        if (configs == null || configs.isEmpty())
            return;

        for (Map.Entry<String, String> entry : configs.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            SystemConfig config = configRepository.findById(key)
                    .orElse(SystemConfig.builder()
                            .configKey(key)
                            .build());

            config.setConfigValue(value);
            configRepository.save(config);
            log.info("Updated config: {} = {}", key, value);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getAllConfigs() {
        List<SystemConfig> all = configRepository.findAll();
        Map<String, String> result = new HashMap<>();
        for (SystemConfig config : all) {
            result.put(config.getConfigKey(), config.getConfigValue());
        }
        return result;
    }
}
