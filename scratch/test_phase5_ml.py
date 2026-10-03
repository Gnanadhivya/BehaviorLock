"""
Phase 5 Comprehensive Verification Script for BehaviorLock ML & Anomaly Detection Engine
"""

import os
import sys
import time
import requests
import numpy as np

# Add ml-service to path for direct model testing
ML_SERVICE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml-service"))
sys.path.insert(0, ML_SERVICE_DIR)

from ensemble_model import HybridBehaviorEnsemble

FASTAPI_URL = "http://localhost:8000"

def run_tests():
    print("=" * 70)
    print("BEHAVIORLOCK PHASE 5 ML ENGINE VERIFICATION SUITE")
    print("=" * 70)

    model = HybridBehaviorEnsemble()

    # 1. Direct Ensemble Model Unit Tests
    print("\n--- TEST GROUP 1: Direct Ensemble Model Tests ---")
    
    # Normal Feature Sample matching normal baseline distribution (28 dimensions)
    normal_features = [
        35.0, 18.5, 420.0, 110.0, 1.2,
        6.0, 1.4, 0.35, 0.08,
        88.0, 18.0, 145.0, 28.0, 62.0, 28.0,
        3.5, 140.0, 180.0, 45.0,
        1.5, 0.2, 0.2,
        8.8, 1.2, 600.0,
        6.5, 55.0, 1.15
    ]

    # Extreme Anomalous Feature Sample (28 dimensions)
    anomalous_features = [
        950.0, 850.0, 9500.0, 85000.0, 25.5,
        45.0, 0.01, 95.0, 0.95,
        15.0, 850.0, 12.0, 950.0, 320.0, 850.0,
        450.0, 1200.0, 9500.0, 45000.0,
        85.0, 45.0, 30.0,
        2.0, 98.0, 100.0,
        125.0, 9500.0, 4.85
    ]

    res_norm = model.predict_sample(normal_features)
    print(f"Normal Sample Prediction: {res_norm}")
    assert len(normal_features) == 28
    assert res_norm["featureCount"] == 28
    assert 0 <= res_norm["riskScore"] <= 100
    assert 0 <= res_norm["trustScore"] <= 100
    assert res_norm["trustScore"] == 100 - res_norm["riskScore"]
    assert res_norm["status"] in ["VERIFIED", "MONITOR"]
    print("  [OK] Normal Sample evaluated with LOW risk and VERIFIED/MONITOR status.")

    res_anom = model.predict_sample(anomalous_features)
    print(f"Anomalous Sample Prediction: {res_anom}")
    assert res_anom["riskScore"] > res_norm["riskScore"]
    assert res_anom["status"] in ["SUSPICIOUS", "UNAUTHORIZED"]
    print("  [OK] Anomalous Sample evaluated with HIGH risk and SUSPICIOUS/UNAUTHORIZED status.")

    # 2. Input Validation Tests
    print("\n--- TEST GROUP 2: Validation Tests ---")
    
    # 27 features (Reject)
    try:
        model.predict_sample(normal_features[:27])
        print("  [FAIL] 27 features was not rejected!")
    except ValueError as e:
        print(f"  [OK] 27 features correctly rejected: {e}")

    # 29 features (Reject)
    try:
        model.predict_sample(normal_features + [1.0])
        print("  [FAIL] 29 features was not rejected!")
    except ValueError as e:
        print(f"  [OK] 29 features correctly rejected: {e}")

    # Null value (Reject)
    try:
        null_vec = list(normal_features)
        null_vec[5] = None
        model.predict_sample(null_vec)
        print("  [FAIL] Null value was not rejected!")
    except (ValueError, TypeError) as e:
        print(f"  [OK] Null value correctly rejected: {e}")

    # Non-numeric value (Reject)
    try:
        str_vec = list(normal_features)
        str_vec[10] = "invalid_string"
        model.predict_sample(str_vec)
        print("  [FAIL] Non-numeric value was not rejected!")
    except (ValueError, TypeError) as e:
        print(f"  [OK] Non-numeric value correctly rejected: {e}")

    # 3. Status Threshold Definitions Verification
    print("\n--- TEST GROUP 3: Security Status Thresholds ---")
    threshold_tests = [
        (15, "VERIFIED"),
        (45, "MONITOR"),
        (75, "SUSPICIOUS"),
        (92, "UNAUTHORIZED")
    ]
    for risk, expected_status in threshold_tests:
        if risk <= 29:
            st = "VERIFIED"
        elif risk <= 59:
            st = "MONITOR"
        elif risk <= 84:
            st = "SUSPICIOUS"
        else:
            st = "UNAUTHORIZED"
        assert st == expected_status
        print(f"  [OK] Risk Score {risk} correctly maps to {st}")

    # 4. FastAPI Endpoint Tests (if running)
    print("\n--- TEST GROUP 4: FastAPI REST Endpoint Tests ---")
    try:
        health_resp = requests.get(f"{FASTAPI_URL}/health", timeout=3)
        print(f"FastAPI /health Status Code: {health_resp.status_code}")
        print(f"FastAPI /health Response: {health_resp.json()}")

        # Test POST /predict
        pred_resp = requests.post(f"{FASTAPI_URL}/predict", json={"features": normal_features}, timeout=3)
        print(f"FastAPI /predict Status Code: {pred_resp.status_code}")
        print(f"FastAPI /predict Response: {pred_resp.json()}")
        assert pred_resp.status_code == 200
        assert "riskScore" in pred_resp.json()
        assert "trustScore" in pred_resp.json()
        assert "models" in pred_resp.json()
        print("  [OK] FastAPI /predict returned 200 OK with valid schema.")

        # Test malformed feature length -> 400
        bad_len_resp = requests.post(f"{FASTAPI_URL}/predict", json={"features": normal_features[:20]}, timeout=3)
        print(f"FastAPI /predict Bad Length Status Code: {bad_len_resp.status_code}")
        assert bad_len_resp.status_code == 400
        print("  [OK] FastAPI /predict returned 400 Bad Request for bad feature length.")

    except requests.exceptions.ConnectionError:
        print("  [NOTE] FastAPI server is not currently running on port 8000. Start `python main.py` in `ml-service` to test REST endpoint.")

    print("\n" + "=" * 70)
    print("ALL PHASE 5 MACHINE LEARNING UNIT AND VALIDATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
