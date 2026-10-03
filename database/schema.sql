-- BehaviorLock MySQL Database Schema (Phase 4 Update)

CREATE DATABASE IF NOT EXISTS behaviorlock;
USE behaviorlock;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS behavioral_analysis;
DROP TABLE IF EXISTS security_alerts;
DROP TABLE IF EXISTS behavior_telemetry;
DROP TABLE IF EXISTS user_baselines;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Active Sessions / Devices table
CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    device_name VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address VARCHAR(50),
    location VARCHAR(255) DEFAULT 'Unknown',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Behavioral Analysis Table (Phase 4 28D Feature Window Storage)
CREATE TABLE behavioral_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    timestamp VARCHAR(100) NOT NULL,
    window_duration INT NOT NULL,
    feature_vector TEXT NOT NULL, -- JSON Array of 28 numeric values
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Behavior Telemetry & ML Scoring Logs
CREATE TABLE behavior_telemetry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    window_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    features_json TEXT NOT NULL,
    isolation_forest_score DOUBLE NOT NULL,
    oc_svm_score DOUBLE NOT NULL,
    ensemble_anomaly_score DOUBLE NOT NULL,
    risk_score INT NOT NULL,
    trust_score INT NOT NULL,
    security_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Security Alerts Table
CREATE TABLE security_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    risk_score INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexing
CREATE INDEX idx_analysis_user ON behavioral_analysis(user_id, created_at);
CREATE INDEX idx_users_email ON users(email);
