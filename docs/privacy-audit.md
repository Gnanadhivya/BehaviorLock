# BehaviorLock — Behavioral Privacy Audit Verification Report

**Date**: September 25, 2026  
**System**: BehaviorLock Continuous Behavioral Authentication Platform  
**Version**: 1.0.0-Production Hardened  

---

## 1. Executive Summary

BehaviorLock is built upon a **Privacy-First Zero-Text Architecture**. Continuous user authentication is performed solely by analyzing aggregated, non-sensitive statistical behavioral dynamics (keystroke timing, mouse velocity, trajectory curvature, click hold duration, scroll frequency). 

This privacy audit confirms that BehaviorLock does **NOT** capture, store, log, or transmit raw typed text, passwords, key codes, key names, clipboard contents, sensitive user content, or permanent mouse trajectory traces.

---

## 2. Privacy-Preserving Data Collection Policy

### 2.1 Data EXPLICITLY NOT Collected or Stored
The BehaviorLock telemetry SDK explicitly prohibits collecting and storing:
* ❌ **Raw Typed Characters**: Letters, numbers, symbols, and typed content are never recorded.
* ❌ **Key Names & Key Codes**: Specific key identifiers (e.g., `'A'`, `'Backspace'`, `'Enter'`) are discarded immediately.
* ❌ **Passwords & Credentials**: Input field values and credentials are completely isolated from telemetry listeners.
* ❌ **Clipboard Content**: Copy, paste, or cut buffer data is never inspected or accessed.
* ❌ **Raw Mouse Trajectory Streams**: Mouse coordinates are kept temporarily in memory (max 200 points) only to calculate arc distance and curvature, then immediately discarded upon batch processing.
* ❌ **Raw Click Coordinates**: Permanent spatial click locations are not saved.
* ❌ **Sensitive Personal Information**: No PII beyond standard account email/name is stored.

---

## 3. Data Collected & 28-Dimensional Feature Vector

BehaviorLock aggregates raw micro-timing events into **5–10 second evaluation windows**. The telemetry worker computes summary statistical metrics across 4 core modalities:
1. **Keystroke Dynamics**: Dwell Time (DT, key press duration) & Flight Time (FT, key transition interval).
2. **Mouse Movement Dynamics**: Cursor Velocity (px/ms) & Trajectory Curvature Index ($C = \text{Straight Distance} / \text{Arc Distance}$).
3. **Click Dynamics**: Click hold duration.
4. **Scroll Dynamics**: Wheel scroll frequency.

### The 28-Dimensional Feature Vector Specification

| Index Range | Feature Category | Description | Data Type |
|---|---|---|---|
| `0`–`6` | Primary Dynamics | `[dwellMean, dwellStd, flightMean, velocityMean, curvatureIndex, holdMean, scrollFreq]` | `float64` |
| `7`–`13` | Keystroke Distribution | Dwell & Flight time quantiles (P10, P25, P50, P75, P90, min, max) | `float64` |
| `14`–`20` | Mouse Trajectory | Velocity std, acceleration, curvature quantiles, movement bounds | `float64` |
| `21`–`27` | Interaction & Rhythm | Click hold variance, scroll interval, pause ratios, burst frequencies | `float64` |

---

## 4. Aggregation Window & Storage Policy

* **Aggregation Window**: Raw timing events are buffered in memory and flushed in **5–10 second sliding windows**.
* **Off-Thread Processing**: Feature extraction runs in a Web Worker thread (`telemetryWorker.js`) to ensure UI responsiveness.
* **Storage Policy**:
  - Raw micro-timing buffers are purged immediately after batch feature extraction.
  - Database stores only the 28 numerical statistical features (`behavioral_analysis` & `behavior_telemetry` tables).
  - No raw event streams or coordinates exist in MySQL storage.

---

## 5. Device Fingerprinting Policy

BehaviorLock utilizes a **Privacy-Conscious SHA-256 Device Fingerprint** for multi-device management:
* **Inputs**: Non-sensitive browser specs (`userAgent`, operating system, screen resolution, timezone, system language).
* **Cryptographic Hash**: Raw spec string is hashed via standard SHA-256. Only the non-reversible hex hash digest string is stored as `deviceFingerprint`.
* **Purpose**: Identifies login from unknown hardware/browsers to trigger `NEW_DEVICE_LOGIN` audit logs and alerts, without tracking user location or hardware serial numbers.

---

## 6. Security Purpose & Baseline Compliance

* **Authoritative Control**: All risk scoring and state machine transitions (`VERIFIED` $\to$ `MONITORING` $\to$ `SUSPICIOUS` $\to$ `REAUTH_REQUIRED` $\to$ `LOCKED`) are controlled exclusively by the backend.
* **Baseline Learning**: Anomaly detection compares current 28D feature vectors against the user's learned baseline model (Isolation Forest + One-Class SVM).
* **Fail-Safe Operation**: If the ML service is unreachable, backend defaults to a cautionary `MONITORING` state (risk 50) rather than falsely asserting `VERIFIED`.

---

**Audit Status**: **APPROVED & VERIFIED**  
*The BehaviorLock system strictly complies with privacy-preserving continuous authentication standards.*
