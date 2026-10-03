package com.behaviorlock.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceFingerprintDto {
    private String deviceFingerprint;
    private String deviceName;
    private String browser;
    private String operatingSystem;
    private String screenResolution;
    private String timezone;
    private String language;
}
