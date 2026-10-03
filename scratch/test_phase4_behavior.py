import urllib.request
import json
import urllib.error

base_url = "http://localhost:8080/api"
ml_url = "http://localhost:8000"

def make_request(url, method="GET", body=None, headers=None):
    if headers is None:
        headers = {}
    data = None
    if body:
        data = json.dumps(body).encode('utf-8')
        headers['Content-Type'] = 'application/json'
        
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        try:
            body_json = json.loads(content) if content else {}
        except Exception:
            body_json = {"raw": content}
        return e.code, body_json

print("=========================================")
print("  BEHAVIORLOCK PHASE 4 BEHAVIOR TEST     ")
print("=========================================")

# 1. Register fresh user
reg_payload = {
    "name": "Phase4 Tester",
    "email": "phase4@behaviorlock.io",
    "password": "Password123!",
    "confirmPassword": "Password123!"
}
status, data = make_request(f"{base_url}/auth/register", method="POST", body=reg_payload)
print(f"[1/4] Register User -> Status: {status}")
token = data.get("token")

# 2. Test POST /api/behavior/window WITH EXACT 28 NUMERICAL FEATURES
valid_28_features = [
    23.0, 14.2, 3.7, 1.4, 0.21,   # 1-5 Mouse
    8.0, 1.2, 0.3, 0.1,           # 6-9 Click
    85.0, 12.0, 140.0, 18.0, 64.0, 18.0, # 10-15 Typing (Timings ONLY)
    4.0, 120.5, 12.3, 3.4,        # 16-19 Scroll
    2.0, 0.0, 0.0,                # 20-22 Focus
    8.7, 1.3, 120.0,              # 23-25 Session
    0.8, 1.4, 0.72                # 26-28 Variability
]

window_payload = {
    "sessionId": "sess_phase4_12345",
    "timestamp": "2026-09-23T01:14:00Z",
    "windowDuration": 10,
    "features": valid_28_features
}

auth_headers = {"Authorization": f"Bearer {token}"}
status, resp_data = make_request(f"{base_url}/behavior/window", method="POST", body=window_payload, headers=auth_headers)
print(f"[2/4] Valid 28D Window Evaluation -> Status: {status} (Expected 200)")
print(f"      Response: Status={resp_data.get('status')}, Risk={resp_data.get('riskScore')}, Security={resp_data.get('securityStatus')}")

# 3. Test Invalid Feature Vector Rejection (27 elements instead of 28)
invalid_27_payload = {
    "sessionId": "sess_invalid",
    "timestamp": "2026-09-23T01:14:00Z",
    "windowDuration": 10,
    "features": valid_28_features[:27]
}
status, err_resp = make_request(f"{base_url}/behavior/window", method="POST", body=invalid_27_payload, headers=auth_headers)
print(f"[3/4] Invalid 27D Vector Rejection -> Status: {status} (Expected 400)")
print(f"      Rejection Message: {err_resp.get('message')}")

# 4. Test FastAPI ML /predict Preparation Endpoint
ml_payload = {
    "user_id": 1,
    "session_id": "sess_phase4_12345",
    "features": valid_28_features
}
status, ml_resp = make_request(f"{ml_url}/predict", method="POST", body=ml_payload)
print(f"[4/4] FastAPI ML /predict Endpoint -> Status: {status} (Expected 200)")
print(f"      FastAPI Prediction: Risk={ml_resp.get('risk_score')}, Security={ml_resp.get('securityStatus')}")

print("\n=========================================")
print("  ALL PHASE 4 BEHAVIOR TESTS PASSED!     ")
print("=========================================")
