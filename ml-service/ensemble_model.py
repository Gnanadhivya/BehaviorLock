import numpy as np
import pandas as pd
import joblib
import os
import time
from datetime import datetime
from typing import Dict, Any, List

class HybridBehaviorEnsemble:
    """
    Hybrid Anomaly Ensemble combining Isolation Forest and One-Class SVM 
    with equal 0.5 / 0.5 weighting for continuous behavioral authentication.
    Loads persisted scaler and model artifacts from models/ directory.
    """
    def __init__(self, models_dir: str = None):
        self.n_features = 28
        self.version = "1.0.0-hybrid"
        if models_dir is None:
            models_dir = os.path.join(os.path.dirname(__file__), "models")
        self.models_dir = models_dir
        
        self.scaler = None
        self.iso_forest = None
        self.oc_svm = None
        self.is_fitted = False

        self.load_artifacts()

    def load_artifacts(self) -> bool:
        """Loads fitted scaler and model artifacts from disk."""
        scaler_path = os.path.join(self.models_dir, "scaler.pkl")
        iso_path = os.path.join(self.models_dir, "isolation_forest.pkl")
        svm_path = os.path.join(self.models_dir, "one_class_svm.pkl")

        if os.path.exists(scaler_path) and os.path.exists(iso_path) and os.path.exists(svm_path):
            try:
                self.scaler = joblib.load(scaler_path)
                self.iso_forest = joblib.load(iso_path)
                self.oc_svm = joblib.load(svm_path)
                self.is_fitted = True
                print(f"[OK] Successfully loaded model artifacts from {self.models_dir}")
                return True
            except Exception as e:
                print(f"[ERROR] Failed to load model artifacts: {e}")
                self.is_fitted = False
                return False
        else:
            print(f"[WARN] Model artifacts missing in {self.models_dir}. Cold start active.")
            self.is_fitted = False
            return False

    def _normalize_iso_score(self, decision_val: float) -> int:
        """
        Converts Isolation Forest decision function to [0, 100] risk.
        Decision function: > 0 for inliers (normal), < 0 for outliers (anomalous).
        """
        raw_anomaly = -decision_val
        prob = 1.0 / (1.0 + np.exp(-10.0 * raw_anomaly))
        risk = int(round(prob * 100))
        return max(0, min(100, risk))

    def _normalize_svm_score(self, decision_val: float) -> int:
        """
        Converts One-Class SVM decision function to [0, 100] risk.
        Decision function: > 0 for inliers (normal), < 0 for outliers (anomalous).
        """
        raw_anomaly = -decision_val
        prob = 1.0 / (1.0 + np.exp(-2.5 * raw_anomaly))
        risk = int(round(prob * 100))
        return max(0, min(100, risk))

    def predict_sample(self, feature_vector: List[float]) -> Dict[str, Any]:
        """
        Evaluates 28D feature vector using persisted scaler, Isolation Forest, and One-Class SVM.
        Returns risk score (0-100), trust score (100 - risk), security status, and model decision details.
        """
        start_time = time.time()
        
        if not self.is_fitted:
            raise RuntimeError("MODEL_NOT_READY: Artifacts not loaded. Run 'python train.py' to fit baseline models.")

        if len(feature_vector) != self.n_features:
            raise ValueError(f"Expected {self.n_features} features, got {len(feature_vector)}")

        for i, val in enumerate(feature_vector):
            if val is None or np.isnan(val) or not np.isfinite(val):
                raise ValueError(f"Feature at index {i} is invalid, null, or non-finite")

        X_in = np.array(feature_vector, dtype=float).reshape(1, -1)
        X_scaled = self.scaler.transform(X_in)

        # 1. Isolation Forest prediction
        iso_dec = self.iso_forest.decision_function(X_scaled)[0]
        iso_risk = self._normalize_iso_score(iso_dec)
        iso_status = "ANOMALOUS" if iso_risk >= 50 else "NORMAL"

        # 2. One-Class SVM prediction
        svm_dec = self.oc_svm.decision_function(X_scaled)[0]
        svm_risk = self._normalize_svm_score(svm_dec)
        svm_status = "ANOMALOUS" if svm_risk >= 50 else "NORMAL"

        # 3. Hybrid 0.5 / 0.5 Ensemble
        hybrid_risk = int(round(0.5 * iso_risk + 0.5 * svm_risk))
        hybrid_risk = max(0, min(100, hybrid_risk))

        # Trust Score = 100 - Risk Score
        trust_score = max(0, min(100, 100 - hybrid_risk))

        # Security Status Mapping per Phase 5 Specification
        if hybrid_risk <= 29:
            security_status = "VERIFIED"
        elif hybrid_risk <= 59:
            security_status = "MONITOR"
        elif hybrid_risk <= 84:
            security_status = "SUSPICIOUS"
        else:
            security_status = "UNAUTHORIZED"

        proc_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "riskScore": hybrid_risk,
            "trustScore": trust_score,
            "isolationRisk": iso_risk,
            "svmRisk": svm_risk,
            "status": security_status,
            "security_status": security_status,
            "isolation_forest_anomaly": round(iso_risk / 100.0, 4),
            "oc_svm_anomaly": round(svm_risk / 100.0, 4),
            "ensemble_anomaly_score": round(hybrid_risk / 100.0, 4),
            "risk_score": hybrid_risk,
            "trust_score": trust_score,
            "is_anomaly": hybrid_risk >= 60,
            "modelVersion": self.version,
            "predictionTimestamp": datetime.utcnow().isoformat() + "Z",
            "featureCount": self.n_features,
            "processingTimeMs": proc_time_ms,
            "models": {
                "isolationForest": {
                    "status": iso_status,
                    "riskScore": iso_risk
                },
                "oneClassSVM": {
                    "status": svm_status,
                    "riskScore": svm_risk
                },
                "ensemble": {
                    "riskScore": hybrid_risk,
                    "status": security_status
                }
            }
        }
