package com.behaviorlock.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleLoginRequest {
    private String idToken;
    private String email;
    private String name;
    private String picture;
    private DeviceFingerprintDto deviceFingerprint;
}
