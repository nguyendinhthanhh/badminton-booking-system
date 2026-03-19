package com.badminton.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * Shared RestTemplate bean used by GeminiService (and any other HTTP clients).
     * Kept simple — no custom timeouts needed; Gemini responses are fast.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
