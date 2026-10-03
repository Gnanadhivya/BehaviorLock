from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import numpy as np
from ml_engine import ml_engine

app = FastAPI(
    title="BehaviorLock Machine Learning API",
    description="Privacy-Preserving Continuous Behavioral Biometrics Anomaly Detection Engine",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow React app (Vite / localhost)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TelemetryPayload(BaseModel):
    userId: str = Field(..., example="user_12345")
    features: List[float] = Field(..., example=[112.5, 14.2, 85.0, 1.45, 0.92, 130.0, 4.0])
    rawMetrics: Optional[Dict[str, Any]] = None

class EnrollPayload(BaseModel):
    userId: str
    baselineFeatures: Optional[List[List[float]]] = None

class SimulateIntruderPayload(BaseModel):
    userId: str
    mode: str = Field(default="FAST_BOT", example="FAST_BOT")  # FAST_BOT, ERRATIC_MOUSE, SLOW_TYPER

@app.get("/")
def read_root():
    return {
        "service": "BehaviorLock ML Anomaly Engine",
        "status": "ONLINE",
        "privacyPolicy": "Zero-Text / Timing & Kinetics Only",
        "algorithm": "Unsupervised Isolation Forest + EWMA Smoothing"
    }

@app.post("/api/v1/telemetry")
def process_telemetry(payload: TelemetryPayload):
    if len(payload.features) < 4:
        raise HTTPException(status_code=400, detail="Feature vector must contain at least 4 metrics.")
    
    result = ml_engine.process_telemetry(payload.userId, payload.features)
    if payload.rawMetrics:
        result["receivedRawMetrics"] = payload.rawMetrics
    return result

@app.post("/api/v1/enroll")
def enroll_user(payload: EnrollPayload):
    profile = ml_engine.get_profile(payload.userId)
    if payload.baselineFeatures:
        for fv in payload.baselineFeatures:
            profile.add_baseline_sample(fv)
    return {
        "status": "SUCCESS",
        "userId": payload.userId,
        "isEnrolled": profile.is_enrolled,
        "sampleCount": profile.sample_count
    }

@app.get("/api/v1/status/{user_id}")
def get_status(user_id: str):
    profile = ml_engine.get_profile(user_id)
    return {
        "userId": user_id,
        "isEnrolled": profile.is_enrolled,
        "sampleCount": profile.sample_count,
        "previousEWMAScore": round(profile.previous_ewma_score, 4),
        "history": profile.history[-15:]
    }

@app.post("/api/v1/reset-profile")
def reset_profile(payload: EnrollPayload):
    profile = ml_engine.get_profile(payload.userId)
    profile.reset_baseline()
    return {
        "status": "RESET_COMPLETE",
        "userId": payload.userId,
        "isEnrolled": False,
        "sampleCount": 0
    }

@app.post("/api/v1/simulate-intruder")
def simulate_intruder(payload: SimulateIntruderPayload):
    profile = ml_engine.get_profile(payload.userId)
    
    # Generate intruder features depending on attack mode
    if payload.mode == "FAST_BOT":
        # Teleport mouse, zero dwell time variance, super fast typing
        intruder_features = [15.0, 0.5, 10.0, 12.5, 0.99, 10.0, 25.0]
    elif payload.mode == "ERRATIC_MOUSE":
        # Straight line cursor teleportation + massive delays
        intruder_features = [450.0, 120.0, 600.0, 0.05, 0.12, 500.0, 0.0]
    elif payload.mode == "SLOW_TYPER":
        # Heavy delays, long hold times
        intruder_features = [380.0, 95.0, 420.0, 0.30, 0.45, 390.0, 1.0]
    else:
        intruder_features = [500.0, 200.0, 800.0, 0.01, 0.05, 600.0, 0.0]
        
    result = ml_engine.process_telemetry(payload.userId, intruder_features)
    result["simulatedMode"] = payload.mode
    result["injectedFeatures"] = intruder_features
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
