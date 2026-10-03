package com.behaviorlock.backend.repository;

import com.behaviorlock.backend.entity.SecurityAlert;
import com.behaviorlock.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, Long> {
    List<SecurityAlert> findByUserOrderByCreatedAtDesc(User user);
    List<SecurityAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SecurityAlert> findByUserAndStatusOrderByCreatedAtDesc(User user, String status);
    List<SecurityAlert> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
}
