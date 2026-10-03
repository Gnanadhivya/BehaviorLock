package com.behaviorlock.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogDto {
    private Long id;
    private String time;
    private String event;
    private int riskScore;
    private int trustScore;
    private String status;
    private String details;
}
