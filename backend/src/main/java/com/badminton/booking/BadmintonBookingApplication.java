package com.badminton.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BadmintonBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(BadmintonBookingApplication.class, args);
    }

}
