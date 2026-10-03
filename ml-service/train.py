import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import joblib
import os

def generate_synthetic_behavioral_dataset(n_normal=1500, n_anomalous=300):
    np.random.seed(42)

    normal_means = [
        35.0, 18.5, 420.0, 110.0, 1.2,
        6.0, 1.4, 0.35, 0.08,
        88.0, 18.0, 145.0, 28.0, 62.0, 28.0,
        3.5, 140.0, 180.0, 45.0,
        1.5, 0.2, 0.2,
        8.8, 1.2, 600.0,
        6.5, 55.0, 1.15
    ]

    normal_stds = [
        8.0, 4.2, 65.0, 25.0, 0.3,
        2.0, 0.3, 0.08, 0.03,
        10.0, 4.0, 22.0, 6.0, 12.0, 6.0,
        1.2, 30.0, 35.0, 12.0,
        0.5, 0.1, 0.1,
        1.0, 1.0, 200.0,
        1.8, 12.0, 0.25
    ]

    X_normal = []
    for _ in range(n_normal):
        row = np.random.normal(loc=normal_means, scale=normal_stds)
        row = np.maximum(row, 0.0)
        X_normal.append(row)

    X_normal = np.array(X_normal)

    X_anomalous = []
    for _ in range(n_anomalous):
        anomaly_type = np.random.choice(["bot_script", "fast_paste", "erratic_jitter"])
        row = np.copy(normal_means)
        
        if anomaly_type == "bot_script":
            row[2] = np.random.uniform(1800.0, 3500.0)
            row[3] = np.random.uniform(0.1, 2.0)
            row[9] = np.random.uniform(10.0, 25.0)
            row[11] = 0.5
            row[13] = 0.5
            row[14] = np.random.uniform(220.0, 400.0)
        elif anomaly_type == "fast_paste":
            row[14] = np.random.uniform(450.0, 900.0)
            row[12] = np.random.uniform(1.0, 5.0)
            row[26] = np.random.uniform(40.0, 100.0)
        else:
            row[4] = np.random.uniform(8.0, 20.0)
            row[3] = np.random.uniform(600.0, 1500.0)
            row[7] = np.random.uniform(3.0, 8.0)
            row[27] = np.random.uniform(300.0, 800.0)

        row = np.maximum(row, 0.0)
        X_anomalous.append(row)

    X_anomalous = np.array(X_anomalous)

    return X_normal, X_anomalous

def train_and_evaluate_pipeline():
    print("==================================================")
    print("  BEHAVIORLOCK ML MODEL TRAINING & EVALUATION     ")
    print("==================================================")

    print("\n[1/5] Generating normal training baseline and evaluation datasets...")
    X_normal, X_anomalous = generate_synthetic_behavioral_dataset(n_normal=1500, n_anomalous=300)
    print(f"      Normal Baseline Samples: {X_normal.shape[0]}")
    print(f"      Anomalous Evaluation Samples: {X_anomalous.shape[0]}")

    n_train = int(len(X_normal) * 0.8)
    X_train = X_normal[:n_train]
    X_test_normal = X_normal[n_train:]

    print("\n[2/5] Fitting StandardScaler on normal training baseline...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_normal_scaled = scaler.transform(X_test_normal)
    X_anomalous_scaled = scaler.transform(X_anomalous)

    print("\n[3/5] Training Isolation Forest (n_estimators=200, contamination=0.05)...")
    iso_forest = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42
    )
    iso_forest.fit(X_train_scaled)

    print("      Training One-Class SVM (kernel='rbf', gamma='scale', nu=0.05)...")
    oc_svm = OneClassSVM(
        kernel="rbf",
        gamma="scale",
        nu=0.05
    )
    oc_svm.fit(X_train_scaled)

    print("\n[4/5] Evaluating Hybrid Anomaly Ensemble performance...")
    
    def get_risk_score(model_iso, model_svm, sample_scaled):
        iso_dec = model_iso.decision_function(sample_scaled)[0]
        svm_dec = model_svm.decision_function(sample_scaled)[0]

        iso_risk = 1.0 / (1.0 + np.exp(10.0 * iso_dec))
        svm_risk = 1.0 / (1.0 + np.exp(2.5 * svm_dec))

        hybrid_risk = 0.5 * iso_risk + 0.5 * svm_risk
        return int(round(hybrid_risk * 100))

    y_true = np.array([0] * len(X_test_normal) + [1] * len(X_anomalous))
    
    y_pred_ensemble = []
    y_scores_ensemble = []

    for sample in np.vstack((X_test_normal_scaled, X_anomalous_scaled)):
        risk = get_risk_score(iso_forest, oc_svm, sample.reshape(1, -1))
        y_scores_ensemble.append(risk / 100.0)
        y_pred_ensemble.append(1 if risk >= 60 else 0)

    precision = precision_score(y_true, y_pred_ensemble)
    recall = recall_score(y_true, y_pred_ensemble)
    f1 = f1_score(y_true, y_pred_ensemble)
    auc = roc_auc_score(y_true, y_scores_ensemble)
    cm = confusion_matrix(y_true, y_pred_ensemble)

    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn)

    print(f"\n--- MEASURED DEVELOPMENT METRICS ---")
    print(f"  Precision       : {precision:.4f}")
    print(f"  Recall          : {recall:.4f}")
    print(f"  F1-Score        : {f1:.4f}")
    print(f"  ROC AUC Score   : {auc:.4f}")
    print(f"  False Pos Rate  : {fpr:.4f} ({fp}/{fp+tn})")
    print(f"  Confusion Matrix:\n{cm}")

    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)

    print(f"\n[5/5] Saving model artifacts to {models_dir}...")
    scaler_path = os.path.join(models_dir, "scaler.pkl")
    iso_path = os.path.join(models_dir, "isolation_forest.pkl")
    svm_path = os.path.join(models_dir, "one_class_svm.pkl")

    joblib.dump(scaler, scaler_path)
    joblib.dump(iso_forest, iso_path)
    joblib.dump(oc_svm, svm_path)

    print(f"[OK] Saved: {scaler_path}")
    print(f"[OK] Saved: {iso_path}")
    print(f"[OK] Saved: {svm_path}")

    print("\n==================================================")
    print("  MODEL TRAINING & ARTIFACT PERSISTENCE COMPLETE  ")
    print("==================================================")

if __name__ == "__main__":
    train_and_evaluate_pipeline()
