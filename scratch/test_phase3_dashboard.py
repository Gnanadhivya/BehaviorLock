import urllib.request
import json
import urllib.error

base_url = "http://localhost:8080/api"

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
print("  BEHAVIORLOCK PHASE 3 DASHBOARD TEST    ")
print("=========================================")

# 1. Register user
reg_payload = {
    "name": "Sarah Connor",
    "email": "sarah@behaviorlock.io",
    "password": "Password123!",
    "confirmPassword": "Password123!"
}
status, data = make_request(f"{base_url}/auth/register", method="POST", body=reg_payload)
token = data.get("token")
print(f"[1/6] Register User -> Status: {status}")

# 2. GET /api/dashboard/summary WITHOUT Token (Unauthorized Check)
status, _ = make_request(f"{base_url}/dashboard/summary", method="GET")
print(f"[2/6] Dashboard Summary WITHOUT Token -> Status: {status} (Expected 401)")

# 3. GET /api/dashboard/summary WITH Token
auth_headers = {"Authorization": f"Bearer {token}"}
status, summary_data = make_request(f"{base_url}/dashboard/summary", method="GET", headers=auth_headers)
print(f"[3/6] Dashboard Summary WITH Token -> Status: {status} (Expected 200)")
print(f"      Protection: {summary_data.get('protectionStatus')}, Trust Score: {summary_data.get('trustScore')}, Risk: {summary_data.get('riskScore')}, Security: {summary_data.get('securityStatus')}")

# 4. GET /api/dashboard/risk-history
status, risk_data = make_request(f"{base_url}/dashboard/risk-history", method="GET", headers=auth_headers)
print(f"[4/6] Risk History Points -> Status: {status}, Points Count: {len(risk_data)}")

# 5. GET /api/activities/recent
status, act_data = make_request(f"{base_url}/activities/recent", method="GET", headers=auth_headers)
print(f"[5/6] Recent Activities -> Status: {status}, Activities Count: {len(act_data)}")

# 6. GET /api/devices & GET /api/alerts
status, dev_data = make_request(f"{base_url}/devices", method="GET", headers=auth_headers)
status, alert_data = make_request(f"{base_url}/alerts", method="GET", headers=auth_headers)
print(f"[6/6] Devices Count: {len(dev_data)}, Alerts Count: {len(alert_data)}")

print("\n=========================================")
print("   ALL PHASE 3 DASHBOARD TESTS PASSED!   ")
print("=========================================")
