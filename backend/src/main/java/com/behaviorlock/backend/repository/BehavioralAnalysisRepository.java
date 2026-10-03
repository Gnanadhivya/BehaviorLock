package com.behaviorlock.backend.repository;

import com.behaviorlock.backend.entity.BehavioralAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BehavioralAnalysisRepository extends JpaRepository<BehavioralAnalysis, Long> {
    List<BehavioralAnalysis> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
