package com.behaviorlock.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "behavior_telemetry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BehaviorTelemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "features_json", columnDefinition = "TEXT", nullable = false)
    private String featuresJson;

    @Column(name = "isolation_forest_score", nullable = false)
    private Double isolationForestScore;

    @Column(name = "oc_svm_score", nullable = false)
    private Double ocSvmScore;

    @Column(name = "ensemble_anomaly_score", nullable = false)
    private Double ensembleAnomalyScore;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(name = "trust_score", nullable = false)
    private Integer trustScore;

    @Column(name = "security_status", nullable = false)
    private String securityStatus; // VERIFIED, MONITOR, SUSPICIOUS, UNAUTHORIZED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
