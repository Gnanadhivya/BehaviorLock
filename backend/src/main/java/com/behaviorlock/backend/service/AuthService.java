package com.behaviorlock.backend.service;

import com.behaviorlock.backend.dto.*;
import com.behaviorlock.backend.entity.Role;
import com.behaviorlock.backend.entity.User;
import com.behaviorlock.backend.exception.BadRequestException;
import com.behaviorlock.backend.exception.ResourceNotFoundException;
import com.behaviorlock.backend.repository.UserRepository;
import com.behaviorlock.backend.security.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final DeviceService deviceService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            DeviceService deviceService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.deviceService = deviceService;
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isEmpty()
                && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT) // Default role as required
                .provider("LOCAL")
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // Register default device session
        deviceService.processDeviceLogin(savedUser, null, "127.0.0.1", "Registration");

        String token = jwtUtils.generateTokenForEmail(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    @Transactional
    public AuthResponse loginUser(LoginRequest request) {
        return loginUserWithDevice(request, "127.0.0.1");
    }

    @Transactional
    public AuthResponse loginUserWithDevice(LoginRequest request, String ipAddress) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new BadRequestException("Account is disabled");
        }

        // Register / Identify Device & Session
        deviceService.processDeviceLogin(user, request.getDeviceFingerprint(), ipAddress, "Password");

        String token = jwtUtils.generateTokenForEmail(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request, String ipAddress) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Google email identity is missing");
        }

        String email = request.getEmail().toLowerCase().trim();

        // Reuse existing user or register new Google user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            String nameStr = request.getName() != null ? request.getName() : email.split("@")[0];
            User newUser = User.builder()
                    .name(nameStr)
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Secure random password placeholder
                    .role(Role.STUDENT)
                    .provider("GOOGLE")
                    .enabled(true)
                    .build();
            return userRepository.save(newUser);
        });

        // Register / Identify Device & Session
        deviceService.processDeviceLogin(user, request.getDeviceFingerprint(), ipAddress, "Google");

        String token = jwtUtils.generateTokenForEmail(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
