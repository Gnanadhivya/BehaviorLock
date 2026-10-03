package com.behaviorlock.backend.repository;

import com.behaviorlock.backend.entity.SecurityEvent;
import com.behaviorlock.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
    List<SecurityEvent> findByUserOrderByTimestampDesc(User user);
    List<SecurityEvent> findByUserAndSessionIdOrderByTimestampDesc(User user, String sessionId);
}
