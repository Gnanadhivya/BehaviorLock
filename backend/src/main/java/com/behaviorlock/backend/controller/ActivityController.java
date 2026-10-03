package com.behaviorlock.backend.controller;

import com.behaviorlock.backend.dto.ActivityLogDto;
import com.behaviorlock.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final DashboardService dashboardService;

    public ActivityController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLogDto>> getRecentActivities() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(dashboardService.getRecentActivities(auth.getName()));
    }
}
