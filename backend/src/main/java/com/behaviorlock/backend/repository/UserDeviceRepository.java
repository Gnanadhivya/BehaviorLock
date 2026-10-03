package com.behaviorlock.backend.repository;

import com.behaviorlock.backend.entity.User;
import com.behaviorlock.backend.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    List<UserDevice> findByUserOrderByLastSeenAtDesc(User user);
    List<UserDevice> findByUserId(Long userId);
    Optional<UserDevice> findByUserAndDeviceFingerprint(User user, String deviceFingerprint);
    List<UserDevice> findByUserAndStatus(User user, String status);
    List<UserDevice> findByUserIdAndStatus(Long userId, String status);
    long countByUserIdAndStatus(Long userId, String status);
}
