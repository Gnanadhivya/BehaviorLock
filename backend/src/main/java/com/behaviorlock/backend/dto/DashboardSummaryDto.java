package com.behaviorlock.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {
    private boolean protectionActive;
    private String protectionStatus;
    private int trustScore;
    private int riskScore;
    private String securityStatus;
    private String sessionDuration;
    private String lastAnalysisTime;
    private long todayActivitiesCount;
    private long activeDevicesCount;
    private long openAlertsCount;
}
