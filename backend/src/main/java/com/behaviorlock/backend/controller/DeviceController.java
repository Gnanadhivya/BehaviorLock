package com.behaviorlock.backend.controller;

import com.behaviorlock.backend.dto.DeviceDto;
import com.behaviorlock.backend.entity.User;
import com.behaviorlock.backend.exception.BadRequestException;
import com.behaviorlock.backend.repository.UserRepository;
import com.behaviorlock.backend.service.DeviceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;
    private final UserRepository userRepository;

    public DeviceController(
            DeviceService deviceService,
            UserRepository userRepository
    ) {
        this.deviceService = deviceService;
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
    public ResponseEntity<List<DeviceDto>> getDevices() {
        User user = getAuthenticatedUser();
        List<DeviceDto> devices = deviceService.getUserDevices(user);
        return ResponseEntity.ok(devices);
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<Map<String, Object>> revokeDevice(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        deviceService.revokeDevice(user, id);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Device session revoked successfully");
        resp.put("deviceId", id);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/revoke-all")
    public ResponseEntity<Map<String, Object>> revokeAllOtherDevices() {
        User user = getAuthenticatedUser();
        deviceService.revokeAllOtherDevices(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "All other active device sessions revoked successfully");
        return ResponseEntity.ok(resp);
    }
}
