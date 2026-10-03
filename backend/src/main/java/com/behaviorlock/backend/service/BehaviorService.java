package com.behaviorlock.backend.service;

import com.behaviorlock.backend.dto.BehaviorWindowRequest;
import com.behaviorlock.backend.dto.BehaviorWindowResponse;
import com.behaviorlock.backend.entity.BehaviorTelemetry;
import com.behaviorlock.backend.entity.BehavioralAnalysis;
import com.behaviorlock.backend.entity.User;
import com.behaviorlock.backend.exception.BadRequestException;
import com.behaviorlock.backend.repository.BehaviorTelemetryRepository;
import com.behaviorlock.backend.repository.BehavioralAnalysisRepository;
import com.behaviorlock.backend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BehaviorService {

    private final UserRepository userRepository;
    private final BehavioralAnalysisRepository analysisRepository;
    private final BehaviorTelemetryRepository telemetryRepository;
    private final SecurityStateMachineService stateMachineService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${behaviorlock.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    public BehaviorService(
            UserRepository userRepository,
            BehavioralAnalysisRepository analysisRepository,
            BehaviorTelemetryRepository telemetryRepository,
            SecurityStateMachineService stateMachineService,
            RestTemplate restTemplate,
            ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.analysisRepository = analysisRepository;
        this.telemetryRepository = telemetryRepository;
        this.stateMachineService = stateMachineService;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public BehaviorWindowResponse processWindow(String email, BehaviorWindowRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Authenticated user not found"));

        List<Double> features = request.getFeatures();
        if (features == null || features.size() != 28) {
            throw new BadRequestException("Feature vector must contain exactly 28 numerical values");
        }

        for (int i = 0; i < features.size(); i++) {
            Double val = features.get(i);
            if (val == null || Double.isNaN(val) || Double.isInfinite(val)) {
                throw new BadRequestException("Feature at index " + i + " is null, NaN, or non-finite");
            }
        }

        String jsonVector;
        try {
            jsonVector = objectMapper.writeValueAsString(features);
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Error serializing feature vector to JSON");
        }

        // Save raw analysis window to database
        BehavioralAnalysis analysis = BehavioralAnalysis.builder()
                .user(user)
                .sessionId(request.getSessionId())
                .timestamp(request.getTimestamp())
                .windowDuration(request.getWindowDuration())
                .featureVector(jsonVector)
                .build();
        analysisRepository.save(analysis);

        // Call FastAPI ML Service /predict with fail-safe defaults (MONITORING / risk 50) in case ML service fails
        int riskScore = 50;
        int trustScore = 50;
        int isoRisk = 50;
        int svmRisk = 50;
        String securityStatus = "MONITORING";
        String modelVersion = "1.0.0-hybrid";
        Double processingTimeMs = 0.0;
        Map<String, Object> modelsMap = new HashMap<>();

        try {
            Map<String, Object> mlPayload = new HashMap<>();
            mlPayload.put("features", features);
            mlPayload.put("user_id", user.getId());
            mlPayload.put("session_id", request.getSessionId());

            @SuppressWarnings("unchecked")
            Map<String, Object> mlResp = restTemplate.postForObject(mlServiceUrl + "/predict", mlPayload, Map.class);
            if (mlResp != null) {
                if (mlResp.containsKey("riskScore")) {
                    riskScore = ((Number) mlResp.get("riskScore")).intValue();
                } else if (mlResp.containsKey("risk_score")) {
                    riskScore = ((Number) mlResp.get("risk_score")).intValue();
                }

                if (mlResp.containsKey("trustScore")) {
                    trustScore = ((Number) mlResp.get("trustScore")).intValue();
                } else {
                    trustScore = 100 - riskScore;
                }

                if (mlResp.containsKey("isolationRisk")) {
                    isoRisk = ((Number) mlResp.get("isolationRisk")).intValue();
                }

                if (mlResp.containsKey("svmRisk")) {
                    svmRisk = ((Number) mlResp.get("svmRisk")).intValue();
                }

                if (mlResp.containsKey("status")) {
                    securityStatus = (String) mlResp.get("status");
                } else if (mlResp.containsKey("security_status")) {
                    securityStatus = (String) mlResp.get("security_status");
                }

                if (mlResp.containsKey("modelVersion")) {
                    modelVersion = (String) mlResp.get("modelVersion");
                }

                if (mlResp.containsKey("processingTimeMs")) {
                    processingTimeMs = ((Number) mlResp.get("processingTimeMs")).doubleValue();
                }

                if (mlResp.containsKey("models")) {
                    modelsMap = (Map<String, Object>) mlResp.get("models");
                }
            }
        } catch (Exception e) {
            // Fallback safe calculation if ML service is unreachable
            System.err.println("FastAPI ML prediction call failed: " + e.getMessage());
        }

        // Authoritative Backend State Engine Evaluation
        String authoritativeState = stateMachineService.evaluateSessionRisk(user, request.getSessionId(), riskScore, trustScore);

        // Save telemetry score log to database
        BehaviorTelemetry telemetry = BehaviorTelemetry.builder()
                .user(user)
                .sessionId(1L)
                .featuresJson(jsonVector)
                .isolationForestScore(isoRisk / 100.0)
                .ocSvmScore(svmRisk / 100.0)
                .ensembleAnomalyScore(riskScore / 100.0)
                .riskScore(riskScore)
                .trustScore(trustScore)
                .securityStatus(authoritativeState)
                .build();
        telemetryRepository.save(telemetry);

        return BehaviorWindowResponse.builder()
                .status("SUCCESS")
                .message("Behavioral analysis window evaluated through hybrid ML pipeline")
                .sessionId(request.getSessionId())
                .riskScore(riskScore)
                .trustScore(trustScore)
                .isolationRisk(isoRisk)
                .svmRisk(svmRisk)
                .securityStatus(authoritativeState)
                .modelVersion(modelVersion)
                .processingTimeMs(processingTimeMs)
                .models(modelsMap)
                .build();
    }
}
