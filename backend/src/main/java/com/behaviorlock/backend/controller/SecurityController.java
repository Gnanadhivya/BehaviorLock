package com.behaviorlock.backend.controller;

import com.behaviorlock.backend.entity.BehaviorTelemetry;
import com.behaviorlock.backend.entity.SecurityEvent;
import com.behaviorlock.backend.entity.User;
import com.behaviorlock.backend.entity.UserSession;
import com.behaviorlock.backend.exception.BadRequestException;
import com.behaviorlock.backend.repository.BehaviorTelemetryRepository;
import com.behaviorlock.backend.repository.SecurityEventRepository;
import com.behaviorlock.backend.repository.UserRepository;
import com.behaviorlock.backend.repository.UserSessionRepository;
import com.behaviorlock.backend.service.SecurityStateMachineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/security")
public class SecurityController {

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final BehaviorTelemetryRepository telemetryRepository;
    private final SecurityEventRepository eventRepository;
    private final SecurityStateMachineService stateMachineService;

    public SecurityController(
            UserRepository userRepository,
            UserSessionRepository sessionRepository,
            BehaviorTelemetryRepository telemetryRepository,
            SecurityEventRepository eventRepository,
            SecurityStateMachineService stateMachineService
    ) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.telemetryRepository = telemetryRepository;
        this.eventRepository = eventRepository;
        this.stateMachineService = stateMachineService;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new BadRequestException("Unauthorized access");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new BadRequestException("Authenticated user not found"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSecurityStatus() {
        User user = getAuthenticatedUser();
        List<UserSession> sessions = sessionRepository.findByUser(user);

        UserSession activeSession = sessions.stream().findFirst().orElse(null);

        String state = activeSession != null && activeSession.getSecurityState() != null ? activeSession.getSecurityState() : "VERIFIED";
        int riskScore = activeSession != null && activeSession.getLastRiskScore() != null ? activeSession.getLastRiskScore() : 12;
        int trustScore = activeSession != null && activeSession.getLastTrustScore() != null ? activeSession.getLastTrustScore() : 88;
        String sessionId = activeSession != null ? activeSession.getSessionToken() : "sess_" + System.currentTimeMillis();

        Map<String, Object> statusMap = new HashMap<>();
        statusMap.put("sessionId", sessionId);
        statusMap.put("state", state);
        statusMap.put("riskScore", riskScore);
        statusMap.put("trustScore", trustScore);
        statusMap.put("lastAnalysis", "Just now");
        statusMap.put("monitoring", !"LOCKED".equalsIgnoreCase(state));
        statusMap.put("reauthRequired", "REAUTH_REQUIRED".equalsIgnoreCase(state));
        statusMap.put("isLocked", "LOCKED".equalsIgnoreCase(state));

        return ResponseEntity.ok(statusMap);
    }

    @GetMapping("/risk-history")
    public ResponseEntity<List<Map<String, Object>>> getRiskHistory() {
        User user = getAuthenticatedUser();
        List<BehaviorTelemetry> telemetries = telemetryRepository.findTop10ByUserIdOrderByIdDesc(user.getId());

        List<Map<String, Object>> history = telemetries.stream().map(t -> {
            Map<String, Object> item = new HashMap<>();
            item.put("timestamp", t.getCreatedAt() != null ? t.getCreatedAt().toString() : new Date().toString());
            item.put("riskScore", t.getRiskScore());
            item.put("trustScore", t.getTrustScore());
            item.put("status", t.getSecurityStatus());
            return item;
        }).collect(Collectors.toList());

        // Reverse so chronological order (oldest to newest) is sent for chart rendering
        Collections.reverse(history);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/reauthenticate")
    public ResponseEntity<Map<String, Object>> reauthenticate(@RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser();
        String password = payload.get("password");
        if (password == null || password.trim().isEmpty()) {
            throw new BadRequestException("Password is required for re-authentication");
        }

        List<UserSession> sessions = sessionRepository.findByUser(user);
        String sessionId = sessions.isEmpty() ? "sess_default" : sessions.get(0).getSessionToken();

        Map<String, Object> result = stateMachineService.processReauth(user, sessionId, password);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/events")
    public ResponseEntity<List<Map<String, Object>>> getSecurityEvents() {
        User user = getAuthenticatedUser();
        List<SecurityEvent> events = eventRepository.findByUserOrderByTimestampDesc(user);

        List<Map<String, Object>> list = events.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("eventType", e.getEventType());
            map.put("riskScore", e.getRiskScore());
            map.put("state", e.getState());
            map.put("metadata", e.getMetadata());
            map.put("timestamp", e.getTimestamp() != null ? e.getTimestamp().toString() : "");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }
}
