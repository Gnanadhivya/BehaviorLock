import numpy as np
from sklearn.ensemble import IsolationForest
import pandas as pd
from typing import Dict, Any, Tuple, List

class UserBehaviorProfile:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.baseline_samples: List[List[float]] = []
        self.model: IsolationForest | None = None
        self.is_enrolled: bool = False
        self.previous_ewma_score: float = 0.20  # Start with safe default
        self.sample_count: int = 0
        self.history: List[Dict[str, Any]] = []

    def add_baseline_sample(self, feature_vector: List[float]):
        self.baseline_samples.append(feature_vector)
        self.sample_count += 1
        
        # Train or retrain Isolation Forest once we have at least 3 samples
        if len(self.baseline_samples) >= 3:
            X = np.array(self.baseline_samples)
            # Add subtle gaussian noise if variance is 0 to avoid degenerate trees
            if np.all(np.std(X, axis=0) == 0):
                X = X + np.random.normal(0, 1e-4, X.shape)
            
            self.model = IsolationForest(
                n_estimators=100,
                contamination=0.08,
                random_state=42
            )
            self.model.fit(X)
            self.is_enrolled = True

    def predict_anomaly(self, feature_vector: List[float]) -> Tuple[float, float, str, Dict[str, Any]]:
        """
        Predicts anomaly for incoming telemetry feature vector.
        Returns: (raw_score, ewma_score, risk_level, breakdown)
        """
        if not self.is_enrolled or self.model is None:
            # Cold start / Enrollment phase
            self.add_baseline_sample(feature_vector)
            return 0.15, 0.15, "LOW", {
                "status": "ENROLLMENT_PHASE",
                "samples_collected": self.sample_count,
                "samples_needed": 3
            }

        X_input = np.array([feature_vector])
        
        # Isolation Forest decision_function outputs values where lower/negative means anomaly.
        # Normal ranges are typically around +0.1 to +0.3. Anomalies are around -0.1 to -0.3.
        raw_decision = self.model.decision_function(X_input)[0]
        
        # Map raw_decision (-0.35 to +0.35) into Anomaly Score [0.0 (Normal) to 1.0 (Anomalous)]
        # Map: decision >= 0.20 -> ~0.05, decision == 0.0 -> 0.50, decision <= -0.20 -> ~0.95
        anomaly_score = float(1.0 / (1.0 + np.exp(6.0 * raw_decision)))
        anomaly_score = max(0.0, min(1.0, anomaly_score))

        # Exponentially Weighted Moving Average (EWMA) smoothing:
        # ewma = alpha * current + (1 - alpha) * prev_ewma
        alpha = 0.65
        ewma_score = float(alpha * anomaly_score + (1.0 - alpha) * self.previous_ewma_score)
        self.previous_ewma_score = ewma_score

        # Determine Progressive Risk Level
        if ewma_score >= 0.78:
            risk_level = "HIGH"
        elif ewma_score >= 0.60:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Also opportunistically update baseline if user is confirmed legitimate (low risk)
        if ewma_score < 0.40 and len(self.baseline_samples) < 50:
            self.add_baseline_sample(feature_vector)

        breakdown = {
            "raw_decision": round(float(raw_decision), 4),
            "instant_anomaly_score": round(anomaly_score, 4),
            "ewma_anomaly_score": round(ewma_score, 4),
            "baseline_samples_count": len(self.baseline_samples),
            "risk_level": risk_level
        }

        # Store in history (keep last 50)
        self.history.append({
            "score": round(ewma_score, 4),
            "risk": risk_level,
            "timestamp": pd.Timestamp.now().isoformat()
        })
        if len(self.history) > 50:
            self.history.pop(0)

        return anomaly_score, ewma_score, risk_level, breakdown

    def reset_baseline(self):
        self.baseline_samples = []
        self.model = None
        self.is_enrolled = False
        self.previous_ewma_score = 0.20
        self.sample_count = 0
        self.history = []

class BehaviorLockEngine:
    def __init__(self):
        self.profiles: Dict[str, UserBehaviorProfile] = {}

    def get_profile(self, user_id: str) -> UserBehaviorProfile:
        if user_id not in self.profiles:
            self.profiles[user_id] = UserBehaviorProfile(user_id)
        return self.profiles[user_id]

    def process_telemetry(self, user_id: str, feature_vector: List[float]) -> Dict[str, Any]:
        profile = self.get_profile(user_id)
        raw_score, ewma_score, risk_level, breakdown = profile.predict_anomaly(feature_vector)
        
        return {
            "userId": user_id,
            "anomalyScore": round(ewma_score, 4),
            "rawScore": round(raw_score, 4),
            "riskLevel": risk_level,
            "isEnrolled": profile.is_enrolled,
            "sampleCount": profile.sample_count,
            "breakdown": breakdown,
            "action": (
                "LOCKOUT" if risk_level == "HIGH" 
                else ("STEP_UP_CHALLENGE" if risk_level == "MEDIUM" else "ALLOW")
            )
        }

# Global Singleton Instance
ml_engine = BehaviorLockEngine()
