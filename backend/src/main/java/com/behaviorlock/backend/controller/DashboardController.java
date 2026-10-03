package com.behaviorlock.backend.controller;

import com.behaviorlock.backend.dto.DashboardSummaryDto;
import com.behaviorlock.backend.dto.RiskHistoryPointDto;
import com.behaviorlock.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    private String getAuthEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary(getAuthEmail()));
    }

    @GetMapping("/risk-history")
    public ResponseEntity<List<RiskHistoryPointDto>> getRiskHistory() {
        return ResponseEntity.ok(dashboardService.getRiskHistory(getAuthEmail()));
    }
}
