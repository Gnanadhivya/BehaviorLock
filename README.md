# BehaviorLock: Zero-Text Continuous Web Authentication Using Hybrid Anomaly Ensembles

BehaviorLock is a privacy-preserving continuous web authentication platform that continuously monitors post-login user behavioral patterns and detects anomalous behavior without capturing or storing raw typed text, key codes, passwords, or permanent raw mouse movement streams.

---

## 🔒 Privacy Guarantee & Feature Vector Architecture

### Zero-Text & Privacy Preservation
- **No Raw Text / Passwords**: The client-side collector computes statistical summary metrics locally in browser memory.
- **No Permanent Raw Mouse Streams**: Mouse coordinates are converted immediately to velocity, acceleration, and curvature metrics.
- **28-Dimensional Feature Vector**: Aggregated statistics are submitted in 5–10 second windows to the backend API.

---

## 🏗️ Architecture Overview

```
React Frontend (Port 5173)
       │
       ▼
Spring Boot REST API (Port 8080) ──► MySQL Database (Port 3306)
       │
       ▼
FastAPI ML Engine (Port 8000)
       │
       ├─► Isolation Forest (n_estimators=200, contamination=0.05)
       └─► One-Class SVM (kernel='rbf', gamma='scale', nu=0.05)
       │
       ▼
Equal 0.5 / 0.5 Ensemble Risk Score (0-100)
```

---

## 🚀 Quickstart & Setup Guide

### 1. Database Setup (MySQL)
Execute `database/schema.sql` and `database/seed.sql` in your MySQL database instance:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. FastAPI ML Service (Port 8000)
```bash
cd ml-service
python -m pip install -r requirements.txt
python main.py
```
- Health Check: `GET http://localhost:8000/health`

### 3. Spring Boot Backend (Port 8080)
```bash
cd backend
mvnw.cmd clean spring-boot:run
```
- Health Check: `GET http://localhost:8080/api/v1/health`

### 4. React Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
- Access web application at `http://localhost:5173`

---

## 📊 Security State Transitions

- **0–29**: `VERIFIED`
- **30–59**: `MONITOR`
- **60–84**: `SUSPICIOUS`
- **85–100**: `UNAUTHORIZED` (Triggers Re-Authentication / Session Revocation)
