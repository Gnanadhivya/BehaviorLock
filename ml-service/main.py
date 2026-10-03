from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os

from ensemble_model import HybridBehaviorEnsemble
import train

app = FastAPI(
    title="BehaviorLock ML Engine",
    description="FastAPI service for continuous zero-text behavioral anomaly detection using Isolation Forest and One-Class SVM ensemble.",
    version="1.0.0-hybrid"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate singleton ensemble model
model = HybridBehaviorEnsemble()

# Cold start auto-recovery check: if artifacts missing, run baseline training script automatically
if not model.is_fitted:
    print("[INFO] Cold start detected. Triggering baseline model training pipeline...")
    try:
        train.train_and_evaluate_pipeline()
        model.load_artifacts()
    except Exception as e:
        print(f"[ERROR] Auto-training pipeline failed: {e}")

class TelemetryPayload(BaseModel):
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    features: List[float] = Field(..., min_length=28, max_length=28, description="28-dimensional aggregated statistical feature vector")

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    if not model.is_fitted:
        return {
            "status": "MODEL_NOT_READY",
            "service": "BehaviorLock ML Engine",
            "model_fitted": False,
            "message": "Model artifacts missing. Run 'python train.py' to generate baseline models.",
            "features_expected": 28
        }
    return {
        "status": "healthy",
        "service": "BehaviorLock ML Engine",
        "model_fitted": model.is_fitted,
        "modelVersion": model.version,
        "features_expected": 28
    }

@app.post("/predict", status_code=status.HTTP_200_OK)
def predict_behavior_window(payload: TelemetryPayload):
    """
    Phase 5 FastAPI /predict Endpoint:
    Evaluates 28D numeric feature vector using persisted StandardScaler, 
    Isolation Forest (200 trees, 0.05 contamination), and One-Class SVM (rbf, nu=0.05).
    """
    if not model.is_fitted:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MODEL_NOT_READY: Model artifacts missing. Run 'python train.py' to fit baseline models."
        )

    try:
        return model.predict_sample(payload.features)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction processing failure: {str(e)}")

@app.post("/api/v1/score", status_code=status.HTTP_200_OK)
def evaluate_telemetry(payload: TelemetryPayload):
    return predict_behavior_window(payload)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
