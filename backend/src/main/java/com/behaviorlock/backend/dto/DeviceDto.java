package com.behaviorlock.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceDto {
    private Long id;
    private String name;
    private String deviceName;
    private String browser;
    private String os;
    private String operatingSystem;
    private String screenResolution;
    private String timezone;
    private String language;
    private String ipAddress;
    private String location;
    private String firstSeen;
    private String lastActive;
    private String status;
    private boolean current;
    private String securityState;
}
