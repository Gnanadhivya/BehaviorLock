-- Seed data for BehaviorLock database

USE behaviorlock;

-- Sample Demo User (password: Password123! - hashed via BCrypt)
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('alex.security@behaviorlock.io', '$2a$10$7R.vD4qV/yU0tC3F9n/k5OaFkOqYq8rM5W5Z3Y1z.X3V1P2Q3R4S', 'Alex Rivera', 'USER');

SET @demo_user_id = LAST_INSERT_ID();

-- Active Session
INSERT INTO user_sessions (user_id, session_token, device_name, browser, os, ip_address, location, status)
VALUES (@demo_user_id, 'demo-session-token-12345', 'MacBook Pro 16"', 'Chrome 124.0', 'macOS 14.4', '192.168.1.45', 'San Francisco, CA, USA', 'ACTIVE');

-- Sample User Baseline record
INSERT INTO user_baselines (user_id, samples_count, status, trained_at)
VALUES (@demo_user_id, 120, 'TRAINED', NOW());

-- Sample Initial Telemetry
INSERT INTO behavior_telemetry (
    user_id, session_id, features_json, 
    isolation_forest_score, oc_svm_score, ensemble_anomaly_score, 
    risk_score, trust_score, security_status
) VALUES (
    @demo_user_id, 
    1, 
    '{"mouse_speed_mean": 420.5, "typing_hold_mean": 85.2, "scroll_speed_mean": 120.0}', 
    0.02, 0.04, 0.03, 
    12, 88, 'VERIFIED'
);

-- Sample Security Alert
INSERT INTO security_alerts (user_id, alert_type, risk_score, reason, status)
VALUES (@demo_user_id, 'TYPING_SPEED_SPIKE', 65, 'Sudden 300% variance in typing flight-time detected', 'OPEN');
