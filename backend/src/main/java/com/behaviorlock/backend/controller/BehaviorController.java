package com.behaviorlock.backend.controller;

import com.behaviorlock.backend.dto.BehaviorWindowRequest;
import com.behaviorlock.backend.dto.BehaviorWindowResponse;
import com.behaviorlock.backend.service.BehaviorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/behavior")
public class BehaviorController {

    private final BehaviorService behaviorService;

    public BehaviorController(BehaviorService behaviorService) {
        this.behaviorService = behaviorService;
    }

    @PostMapping("/window")
    public ResponseEntity<BehaviorWindowResponse> processBehaviorWindow(@Valid @RequestBody BehaviorWindowRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        BehaviorWindowResponse response = behaviorService.processWindow(auth.getName(), request);
        return ResponseEntity.ok(response);
    }
}
