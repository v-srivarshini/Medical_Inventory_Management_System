package com.medistock.backend.controller;

import java.util.List;

//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medistock.backend.dto.ExpiryDTO;
import com.medistock.backend.service.ExpiryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/expiry")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173")
public class ExpiryController {

    private final ExpiryService expiryService;

    @GetMapping
public List<ExpiryDTO> getAllExpiryMedicines() {
    return expiryService.getAllExpiryMedicines();
}

    @GetMapping("/expiring-soon")
    public List<ExpiryDTO> getExpiringSoon() {

        return expiryService.getExpiringSoon();
    }

    @GetMapping("/expired")
    public List<ExpiryDTO> getExpiredMedicines() {

        return expiryService.getExpiredMedicines();
    }
}
