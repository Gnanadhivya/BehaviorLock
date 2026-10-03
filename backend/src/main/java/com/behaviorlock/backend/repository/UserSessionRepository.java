package com.behaviorlock.backend.repository;

import com.behaviorlock.backend.entity.User;
import com.behaviorlock.backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    List<UserSession> findByUserId(Long userId);
    List<UserSession> findByUser(User user);
    Optional<UserSession> findBySessionToken(String sessionToken);
    Optional<UserSession> findByUserAndSessionToken(User user, String sessionToken);
    List<UserSession> findByUserIdAndStatus(Long userId, String status);
    long countByUserIdAndStatus(Long userId, String status);
}
