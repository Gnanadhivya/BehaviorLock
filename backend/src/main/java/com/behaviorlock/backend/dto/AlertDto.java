package com.behaviorlock.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDto {
    private Long id;
    private String type;
    private String alertType;
    private String severity;
    private int riskScore;
    private String timestamp;
    private String createdAt;
    private String status;
    private String message;
    private String reason;
}
