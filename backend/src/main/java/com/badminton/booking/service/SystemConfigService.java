package com.badminton.booking.service;

import java.time.LocalTime;
import java.util.Map;

public interface SystemConfigService {
    String getValue(String key, String defaultValue);

    LocalTime getTime(String key, LocalTime defaultTime);

    void updateConfigs(Map<String, String> configs);

    Map<String, String> getAllConfigs();
}
