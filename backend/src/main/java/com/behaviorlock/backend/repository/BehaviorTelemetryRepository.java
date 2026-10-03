package com.behaviorlock.backend.repository;

import com.behaviorlock.backend.entity.BehaviorTelemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BehaviorTelemetryRepository extends JpaRepository<BehaviorTelemetry, Long> {
    List<BehaviorTelemetry> findTop10ByUserIdOrderByIdDesc(Long userId);
    List<BehaviorTelemetry> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    List<BehaviorTelemetry> findTop24ByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<BehaviorTelemetry> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
