package com.behaviorlock.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BehaviorWindowResponse {
    private String status;
    private String message;
    private String sessionId;
    private int riskScore;
    private int trustScore;
    private int isolationRisk;
    private int svmRisk;
    private String securityStatus;
    private String modelVersion;
    private Double processingTimeMs;
    private Map<String, Object> models;
}
