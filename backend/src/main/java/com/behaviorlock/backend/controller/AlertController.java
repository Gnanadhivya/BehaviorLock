package com.behaviorlock.backend.controller;

import com.behaviorlock.backend.dto.AlertDto;
import com.behaviorlock.backend.entity.SecurityAlert;
import com.behaviorlock.backend.entity.User;
import com.behaviorlock.backend.exception.BadRequestException;
import com.behaviorlock.backend.repository.SecurityAlertRepository;
import com.behaviorlock.backend.repository.UserRepository;
import com.behaviorlock.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final DashboardService dashboardService;
    private final SecurityAlertRepository alertRepository;
    private final UserRepository userRepository;

    public AlertController(
            DashboardService dashboardService,
            SecurityAlertRepository alertRepository,
            UserRepository userRepository
    ) {
        this.dashboardService = dashboardService;
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BadRequestException("Unauthorized access");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new BadRequestException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<List<AlertDto>> getAlerts() {
        User user = getAuthenticatedUser();
        List<SecurityAlert> alerts = alertRepository.findByUserOrderByCreatedAtDesc(user);

        List<AlertDto> dtoList = alerts.stream().map(a -> AlertDto.builder()
                .id(a.getId())
                .alertType(a.getAlertType())
                .severity(a.getSeverity())
                .riskScore(a.getRiskScore())
                .reason(a.getReason() != null ? a.getReason() : a.getMessage())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : "")
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<AlertDto>> getUnreadAlerts() {
        User user = getAuthenticatedUser();
        List<SecurityAlert> alerts = alertRepository.findByUserAndStatusOrderByCreatedAtDesc(user, "OPEN");

        List<AlertDto> dtoList = alerts.stream().map(a -> AlertDto.builder()
                .id(a.getId())
                .alertType(a.getAlertType())
                .severity(a.getSeverity())
                .riskScore(a.getRiskScore())
                .reason(a.getReason() != null ? a.getReason() : a.getMessage())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : "")
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Map<String, Object>> resolveAlert(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        SecurityAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Alert not found with ID: " + id));

        // Strict ownership check: Users can only resolve their own alerts
        if (!alert.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized to resolve this alert");
        }

        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
        alertRepository.save(alert);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Alert resolved successfully");
        resp.put("alertId", id);
        return ResponseEntity.ok(resp);
    }
}
