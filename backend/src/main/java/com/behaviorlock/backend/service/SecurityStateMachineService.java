package com.behaviorlock.backend.service;

import com.behaviorlock.backend.entity.*;
import com.behaviorlock.backend.repository.SecurityAlertRepository;
import com.behaviorlock.backend.repository.SecurityEventRepository;
import com.behaviorlock.backend.repository.UserRepository;
import com.behaviorlock.backend.repository.UserSessionRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SecurityStateMachineService {

    private final SecurityAlertRepository alertRepository;
    private final SecurityEventRepository eventRepository;
    private final UserSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Hysteresis window history per session: sessionId -> LinkedList of recent risk scores
    private final Map<String, LinkedList<Integer>> riskScoreHistory = new HashMap<>();

    public SecurityStateMachineService(
            SecurityAlertRepository alertRepository,
            SecurityEventRepository eventRepository,
            UserSessionRepository sessionRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.alertRepository = alertRepository;
        this.eventRepository = eventRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Maps risk score to state according to Phase 6 specifications:
     * 0-29: VERIFIED
     * 30-59: MONITORING
     * 60-84: SUSPICIOUS
     * >= 85: REAUTH_REQUIRED
     */
    public String calculateRawState(int riskScore) {
        if (riskScore <= 29) {
            return "VERIFIED";
        } else if (riskScore <= 59) {
            return "MONITORING";
        } else if (riskScore <= 84) {
            return "SUSPICIOUS";
        } else {
            return "REAUTH_REQUIRED";
        }
    }

    /**
     * Authoritative continuous evaluation of behavioral risk score.
     * Applies hysteresis stability logic and handles state transitions, security alerts, and event logging.
     */
    @Transactional
    public String evaluateSessionRisk(User user, String sessionId, int riskScore, int trustScore) {
        // Retrieve or initialize session
        UserSession session = sessionRepository.findByUserAndSessionToken(user, sessionId)
                .orElseGet(() -> {
                    UserSession newSession = UserSession.builder()
                            .user(user)
                            .sessionToken(sessionId)
                            .deviceName("Primary Browser Session")
                            .browser("Chrome / Modern Web")
                            .os("Windows / Desktop")
                            .status("ACTIVE")
                            .securityState("VERIFIED")
                            .failedReauthAttempts(0)
                            .build();
                    return sessionRepository.save(newSession);
                });

        // If session is already LOCKED, remain LOCKED
        if ("LOCKED".equalsIgnoreCase(session.getSecurityState()) || "LOCKED".equalsIgnoreCase(session.getStatus())) {
            return "LOCKED";
        }

        // Hysteresis / Stability Smoothing: Keep last 3 observations
        riskScoreHistory.putIfAbsent(sessionId, new LinkedList<>());
        LinkedList<Integer> history = riskScoreHistory.get(sessionId);
        history.addLast(riskScore);
        if (history.size() > 3) {
            history.removeFirst();
        }

        // Severe immediate trigger for risk >= 85
        String targetState;
        if (riskScore >= 85) {
            targetState = "REAUTH_REQUIRED";
        } else {
            // Calculate smoothed average risk for hysteresis
            double avgRisk = history.stream().mapToInt(Integer::intValue).average().orElse(riskScore);
            targetState = calculateRawState((int) Math.round(avgRisk));
        }

        String currentState = session.getSecurityState() != null ? session.getSecurityState() : "VERIFIED";

        // Prevent state downgrade if user is currently pending REAUTH_REQUIRED and hasn't re-authenticated
        if ("REAUTH_REQUIRED".equalsIgnoreCase(currentState) && !"VERIFIED".equalsIgnoreCase(targetState)) {
            targetState = "REAUTH_REQUIRED";
        }

        session.setLastRiskScore(riskScore);
        session.setLastTrustScore(trustScore);

        // Check if state transition occurred
        boolean stateChanged = !currentState.equalsIgnoreCase(targetState);
        if (stateChanged) {
            session.setSecurityState(targetState);

            // Create Security Event Log
            SecurityEvent event = SecurityEvent.builder()
                    .user(user)
                    .sessionId(sessionId)
                    .eventType(targetState.equals("SUSPICIOUS") ? "SUSPICIOUS_ACTIVITY" :
                               targetState.equals("REAUTH_REQUIRED") ? "REAUTH_REQUIRED" : "STATE_CHANGE")
                    .riskScore(riskScore)
                    .state(targetState)
                    .metadata("Security state transition from " + currentState + " to " + targetState + " (Risk: " + riskScore + "/100)")
                    .build();
            eventRepository.save(event);

            // Generate Security Alert for elevated states
            if ("SUSPICIOUS".equalsIgnoreCase(targetState)) {
                SecurityAlert alert = SecurityAlert.builder()
                        .user(user)
                        .sessionId(sessionId)
                        .alertType("BEHAVIORAL_ANOMALY")
                        .severity("MEDIUM")
                        .riskScore(riskScore)
                        .message("Unusual behavioral pattern detected during active session.")
                        .reason("Behavioral variation exceeded normal baseline (Risk: " + riskScore + "/100)")
                        .status("OPEN")
                        .build();
                alertRepository.save(alert);
                session.setStatus("SUSPICIOUS");

            } else if ("REAUTH_REQUIRED".equalsIgnoreCase(targetState)) {
                SecurityAlert alert = SecurityAlert.builder()
                        .user(user)
                        .sessionId(sessionId)
                        .alertType("REAUTH_REQUIRED")
                        .severity("HIGH")
                        .riskScore(riskScore)
                        .message("Significant behavioral anomaly detected. Identity re-verification required.")
                        .reason("High behavioral deviation detected (Risk: " + riskScore + "/100)")
                        .status("OPEN")
                        .build();
                alertRepository.save(alert);
                session.setStatus("MONITORING");

            } else if ("MONITORING".equalsIgnoreCase(targetState)) {
                session.setStatus("MONITORING");
            } else if ("VERIFIED".equalsIgnoreCase(targetState)) {
                session.setStatus("ACTIVE");
            }
        }

        sessionRepository.save(session);
        return targetState;
    }

    /**
     * Process password re-authentication attempt for an active user session.
     */
    @Transactional
    public Map<String, Object> processReauth(User user, String sessionId, String rawPassword) {
        Map<String, Object> response = new HashMap<>();

        UserSession session = sessionRepository.findByUserAndSessionToken(user, sessionId)
                .orElseGet(() -> sessionRepository.findByUser(user).stream().findFirst().orElse(null));

        if (session == null) {
            response.put("success", false);
            response.put("message", "Session context not found");
            return response;
        }

        if ("LOCKED".equalsIgnoreCase(session.getSecurityState()) || "LOCKED".equalsIgnoreCase(session.getStatus())) {
            response.put("success", false);
            response.put("state", "LOCKED");
            response.put("message", "Session is locked. Authentication is blocked.");
            return response;
        }

        boolean validPassword = passwordEncoder.matches(rawPassword, user.getPassword());

        if (validPassword) {
            // Restore VERIFIED state
            session.setSecurityState("VERIFIED");
            session.setStatus("ACTIVE");
            session.setFailedReauthAttempts(0);
            sessionRepository.save(session);

            // Log REAUTH_SUCCESS security event
            SecurityEvent event = SecurityEvent.builder()
                    .user(user)
                    .sessionId(sessionId)
                    .eventType("REAUTH_SUCCESS")
                    .riskScore(session.getLastRiskScore() != null ? session.getLastRiskScore() : 0)
                    .state("VERIFIED")
                    .metadata("User successfully re-authenticated password and restored session to VERIFIED.")
                    .build();
            eventRepository.save(event);

            // Resolve open reauth alerts for user
            List<SecurityAlert> openAlerts = alertRepository.findByUserAndStatusOrderByCreatedAtDesc(user, "OPEN");
            for (SecurityAlert alert : openAlerts) {
                if ("REAUTH_REQUIRED".equals(alert.getAlertType()) || "BEHAVIORAL_ANOMALY".equals(alert.getAlertType())) {
                    alert.setStatus("RESOLVED");
                    alert.setResolvedAt(LocalDateTime.now());
                    alertRepository.save(alert);
                }
            }

            response.put("success", true);
            response.put("state", "VERIFIED");
            response.put("message", "Re-authentication successful. Continuous protection restored to VERIFIED.");
            return response;

        } else {
            // Failed re-authentication attempt
            int attempts = (session.getFailedReauthAttempts() != null ? session.getFailedReauthAttempts() : 0) + 1;
            session.setFailedReauthAttempts(attempts);

            SecurityEvent failureEvent = SecurityEvent.builder()
                    .user(user)
                    .sessionId(sessionId)
                    .eventType("REAUTH_FAILURE")
                    .riskScore(session.getLastRiskScore() != null ? session.getLastRiskScore() : 85)
                    .state(session.getSecurityState())
                    .metadata("Failed password re-authentication attempt " + attempts + " of 3.")
                    .build();
            eventRepository.save(failureEvent);

            if (attempts >= 3) {
                // Lock session after 3 failed attempts
                session.setSecurityState("LOCKED");
                session.setStatus("LOCKED");
                sessionRepository.save(session);

                SecurityEvent lockEvent = SecurityEvent.builder()
                        .user(user)
                        .sessionId(sessionId)
                        .eventType("SESSION_LOCKED")
                        .riskScore(100)
                        .state("LOCKED")
                        .metadata("Session locked after 3 consecutive failed re-authentication attempts.")
                        .build();
                eventRepository.save(lockEvent);

                SecurityAlert criticalAlert = SecurityAlert.builder()
                        .user(user)
                        .sessionId(sessionId)
                        .alertType("SESSION_LOCKED")
                        .severity("CRITICAL")
                        .riskScore(100)
                        .message("Session locked due to 3 failed re-authentication attempts.")
                        .reason("Maximum re-authentication attempt threshold exceeded.")
                        .status("OPEN")
                        .build();
                alertRepository.save(criticalAlert);

                response.put("success", false);
                response.put("state", "LOCKED");
                response.put("attemptsRemaining", 0);
                response.put("message", "Maximum re-authentication attempts exceeded. Session locked.");
                return response;

            } else {
                sessionRepository.save(session);
                int remaining = 3 - attempts;

                SecurityAlert failAlert = SecurityAlert.builder()
                        .user(user)
                        .sessionId(sessionId)
                        .alertType("REAUTH_FAILURE")
                        .severity("HIGH")
                        .riskScore(session.getLastRiskScore() != null ? session.getLastRiskScore() : 85)
                        .message("Failed re-authentication attempt (" + attempts + "/3).")
                        .reason("Incorrect password supplied during re-authentication prompt.")
                        .status("OPEN")
                        .build();
                alertRepository.save(failAlert);

                response.put("success", false);
                response.put("state", session.getSecurityState());
                response.put("attemptsRemaining", remaining);
                response.put("message", "Invalid password. " + remaining + " attempt(s) remaining.");
                return response;
            }
        }
    }
}
