package com.behaviorlock.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final RestTemplate restTemplate;

    @Value("${behaviorlock.ml-service.url}")
    private String mlServiceUrl;

    public HealthController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "BehaviorLock Backend");
        response.put("timestamp", System.currentTimeMillis());

        // Check ML Service connectivity
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> mlHealth = restTemplate.getForObject(mlServiceUrl + "/health", Map.class);
            response.put("mlServiceStatus", "CONNECTED");
            response.put("mlServiceDetails", mlHealth);
        } catch (Exception e) {
            response.put("mlServiceStatus", "DISCONNECTED (" + e.getMessage() + ")");
        }

        return ResponseEntity.ok(response);
    }
}
