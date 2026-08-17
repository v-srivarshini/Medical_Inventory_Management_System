package com.medistock.backend.controller;

import java.util.Map;

//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medistock.backend.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173")
public class Analyticscontroller {

    private final AnalyticsService analyticsService;

    @GetMapping
    public Map<String, Object> getAnalytics() {
        return analyticsService.getAnalytics();
    }
}
