package com.behaviorlock.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BehaviorWindowRequest {

    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotBlank(message = "Timestamp is required")
    private String timestamp;

    @NotNull(message = "Window duration is required")
    private Integer windowDuration;

    @NotNull(message = "Features vector is required")
    @Size(min = 28, max = 28, message = "Features vector must contain exactly 28 numerical values")
    private List<Double> features;
}
