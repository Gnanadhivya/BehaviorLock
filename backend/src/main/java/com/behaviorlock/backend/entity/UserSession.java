package com.behaviorlock.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "session_token", nullable = false, unique = true)
    private String sessionToken;

    @Column(name = "device_name")
    private String deviceName;

    private String browser;
    private String os;

    @Column(name = "ip_address")
    private String ipAddress;

    private String location;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, MONITORING, SUSPICIOUS, LOCKED, REVOKED, EXPIRED

    @Builder.Default
    @Column(name = "security_state")
    private String securityState = "VERIFIED"; // VERIFIED, MONITORING, SUSPICIOUS, REAUTH_REQUIRED, LOCKED

    @Builder.Default
    @Column(name = "failed_reauth_attempts")
    private Integer failedReauthAttempts = 0;

    @Column(name = "last_risk_score")
    private Integer lastRiskScore;

    @Column(name = "last_trust_score")
    private Integer lastTrustScore;

    @CreationTimestamp
    @Column(name = "first_seen", updatable = false)
    private LocalDateTime firstSeen;

    @UpdateTimestamp
    @Column(name = "last_active")
    private LocalDateTime lastActive;
}
