package com.behaviorlock.backend.service;

import com.behaviorlock.backend.dto.DeviceDto;
import com.behaviorlock.backend.dto.DeviceFingerprintDto;
import com.behaviorlock.backend.entity.*;
import com.behaviorlock.backend.exception.BadRequestException;
import com.behaviorlock.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    private final UserDeviceRepository deviceRepository;
    private final UserSessionRepository sessionRepository;
    private final SecurityEventRepository eventRepository;
    private final SecurityAlertRepository alertRepository;

    public DeviceService(
            UserDeviceRepository deviceRepository,
            UserSessionRepository sessionRepository,
            SecurityEventRepository eventRepository,
            SecurityAlertRepository alertRepository
    ) {
        this.deviceRepository = deviceRepository;
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
        this.alertRepository = alertRepository;
    }

    /**
     * Generates a stable SHA-256 fingerprint hash from non-sensitive device specs.
     */
    public String generateFingerprintHash(DeviceFingerprintDto fp, User user) {
        if (fp == null || fp.getDeviceFingerprint() == null || fp.getDeviceFingerprint().trim().isEmpty()) {
            String raw = (user != null ? user.getEmail() : "anon") + "|" +
                    (fp != null && fp.getBrowser() != null ? fp.getBrowser() : "Chrome") + "|" +
                    (fp != null && fp.getOperatingSystem() != null ? fp.getOperatingSystem() : "Windows");
            return hashSHA256(raw);
        }
        return fp.getDeviceFingerprint().trim();
    }

    private String hashSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(input.hashCode());
        }
    }

    /**
     * Identifies or registers user device upon login.
     * Logs NEW_DEVICE_LOGIN, SESSION_CREATED security events.
     */
    @Transactional
    public UserDevice processDeviceLogin(User user, DeviceFingerprintDto fpDto, String ipAddress, String loginType) {
        String fpHash = generateFingerprintHash(fpDto, user);
        String browserStr = fpDto != null && fpDto.getBrowser() != null ? fpDto.getBrowser() : "Chrome / Web Browser";
        String osStr = fpDto != null && fpDto.getOperatingSystem() != null ? fpDto.getOperatingSystem() : "Windows";
        String resStr = fpDto != null && fpDto.getScreenResolution() != null ? fpDto.getScreenResolution() : "1920x1080";
        String tzStr = fpDto != null && fpDto.getTimezone() != null ? fpDto.getTimezone() : "UTC";
        String langStr = fpDto != null && fpDto.getLanguage() != null ? fpDto.getLanguage() : "en-US";
        String deviceNameStr = fpDto != null && fpDto.getDeviceName() != null ? fpDto.getDeviceName() : (browserStr + " on " + osStr);

        Optional<UserDevice> existingOpt = deviceRepository.findByUserAndDeviceFingerprint(user, fpHash);
        UserDevice device;

        if (existingOpt.isPresent()) {
            device = existingOpt.get();
            device.setLastSeenAt(LocalDateTime.now());
            device.setIpAddress(ipAddress != null ? ipAddress : "127.0.0.1");
            device.setStatus("ACTIVE");
            deviceRepository.save(device);
        } else {
            // New Device Registration
            device = UserDevice.builder()
                    .user(user)
                    .deviceFingerprint(fpHash)
                    .deviceName(deviceNameStr)
                    .browser(browserStr)
                    .operatingSystem(osStr)
                    .screenResolution(resStr)
                    .timezone(tzStr)
                    .language(langStr)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .status("ACTIVE")
                    .build();
            device = deviceRepository.save(device);

            // Log NEW_DEVICE_LOGIN Event
            SecurityEvent newDeviceEvent = SecurityEvent.builder()
                    .user(user)
                    .sessionId("sess_" + System.currentTimeMillis())
                    .eventType("NEW_DEVICE_LOGIN")
                    .riskScore(15)
                    .state("VERIFIED")
                    .metadata("First login detected from new device: " + deviceNameStr + " (" + browserStr + " / " + osStr + ")")
                    .build();
            eventRepository.save(newDeviceEvent);

            // Generate LOW Severity Security Alert
            SecurityAlert alert = SecurityAlert.builder()
                    .user(user)
                    .sessionId("sess_" + System.currentTimeMillis())
                    .alertType("NEW_DEVICE_LOGIN")
                    .severity("LOW")
                    .riskScore(15)
                    .message("New device registered: " + deviceNameStr)
                    .reason("Session initiated from unrecognized device fingerprint.")
                    .status("OPEN")
                    .build();
            alertRepository.save(alert);
        }

        // Log Specific Authentication Event (PASSWORD_LOGIN / GOOGLE_LOGIN)
        SecurityEvent authEvent = SecurityEvent.builder()
                .user(user)
                .sessionId("sess_" + System.currentTimeMillis())
                .eventType("GOOGLE".equalsIgnoreCase(loginType) ? "GOOGLE_LOGIN" : "PASSWORD_LOGIN")
                .riskScore(5)
                .state("VERIFIED")
                .metadata("Authenticated successfully via " + loginType + " login.")
                .build();
        eventRepository.save(authEvent);

        // Update/Create UserSession
        String sessionToken = "sess_" + user.getId() + "_" + System.currentTimeMillis();
        UserSession session = UserSession.builder()
                .user(user)
                .sessionToken(sessionToken)
                .deviceName(deviceNameStr)
                .browser(browserStr)
                .os(osStr)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .location("Localhost")
                .status("ACTIVE")
                .securityState("VERIFIED")
                .failedReauthAttempts(0)
                .lastRiskScore(5)
                .lastTrustScore(95)
                .build();
        sessionRepository.save(session);

        // Log SESSION_CREATED Event
        SecurityEvent sessionEvent = SecurityEvent.builder()
                .user(user)
                .sessionId(sessionToken)
                .eventType("SESSION_CREATED")
                .riskScore(5)
                .state("VERIFIED")
                .metadata("Active session created for device: " + deviceNameStr)
                .build();
        eventRepository.save(sessionEvent);

        return device;
    }

    /**
     * Retrieve authenticated user's devices only.
     */
    @Transactional(readOnly = true)
    public List<DeviceDto> getUserDevices(User user) {
        List<UserDevice> devices = deviceRepository.findByUserOrderByLastSeenAtDesc(user);

        if (devices.isEmpty()) {
            return Collections.emptyList();
        }

        Long newestId = devices.get(0).getId();

        return devices.stream().map(d -> DeviceDto.builder()
                .id(d.getId())
                .name(d.getDeviceName() != null ? d.getDeviceName() : d.getBrowser() + " on " + d.getOperatingSystem())
                .deviceName(d.getDeviceName())
                .browser(d.getBrowser())
                .os(d.getOperatingSystem())
                .operatingSystem(d.getOperatingSystem())
                .screenResolution(d.getScreenResolution())
                .timezone(d.getTimezone())
                .language(d.getLanguage())
                .ipAddress(d.getIpAddress())
                .location("Localhost")
                .firstSeen(d.getFirstSeenAt() != null ? d.getFirstSeenAt().toString() : "")
                .lastActive(d.getLastSeenAt() != null ? d.getLastSeenAt().toString() : "")
                .status(d.getStatus())
                .current(d.getId().equals(newestId) && "ACTIVE".equalsIgnoreCase(d.getStatus()))
                .securityState("ACTIVE".equalsIgnoreCase(d.getStatus()) ? "VERIFIED" : "REVOKED")
                .build()).collect(Collectors.toList());
    }

    /**
     * Revoke single device by ID with strict user ownership validation.
     */
    @Transactional
    public void revokeDevice(User user, Long deviceId) {
        UserDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new BadRequestException("Device not found with ID: " + deviceId));

        // Strict ownership check
        if (!device.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized: You do not own this device");
        }

        device.setStatus("REVOKED");
        deviceRepository.save(device);

        // Revoke associated sessions for this user
        List<UserSession> sessions = sessionRepository.findByUser(user);
        for (UserSession s : sessions) {
            if (s.getDeviceName() != null && s.getDeviceName().equalsIgnoreCase(device.getDeviceName())) {
                s.setStatus("REVOKED");
                s.setSecurityState("LOCKED");
                sessionRepository.save(s);
            }
        }

        // Log DEVICE_REVOKED & SESSION_REVOKED events
        SecurityEvent devRevEvent = SecurityEvent.builder()
                .user(user)
                .sessionId("sess_" + System.currentTimeMillis())
                .eventType("DEVICE_REVOKED")
                .riskScore(0)
                .state("VERIFIED")
                .metadata("Device revoked by user: " + device.getDeviceName())
                .build();
        eventRepository.save(devRevEvent);

        SecurityEvent sessRevEvent = SecurityEvent.builder()
                .user(user)
                .sessionId("sess_" + System.currentTimeMillis())
                .eventType("SESSION_REVOKED")
                .riskScore(0)
                .state("VERIFIED")
                .metadata("Session associated with revoked device terminated.")
                .build();
        eventRepository.save(sessRevEvent);
    }

    /**
     * Revokes all active devices except current device.
     */
    @Transactional
    public void revokeAllOtherDevices(User user) {
        List<UserDevice> devices = deviceRepository.findByUserOrderByLastSeenAtDesc(user);
        if (devices.size() <= 1) {
            return;
        }

        UserDevice currentDevice = devices.get(0);

        for (int i = 1; i < devices.size(); i++) {
            UserDevice d = devices.get(i);
            d.setStatus("REVOKED");
            deviceRepository.save(d);
        }

        List<UserSession> sessions = sessionRepository.findByUser(user);
        for (int i = 1; i < sessions.size(); i++) {
            UserSession s = sessions.get(i);
            s.setStatus("REVOKED");
            s.setSecurityState("LOCKED");
            sessionRepository.save(s);
        }

        SecurityEvent event = SecurityEvent.builder()
                .user(user)
                .sessionId("sess_" + System.currentTimeMillis())
                .eventType("ALL_OTHER_DEVICES_REVOKED")
                .riskScore(0)
                .state("VERIFIED")
                .metadata("All other active device sessions revoked by user. Preserved current session on " + currentDevice.getDeviceName())
                .build();
        eventRepository.save(event);
    }
}
