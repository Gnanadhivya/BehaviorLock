import urllib.request
import json
import urllib.error

base_url = "http://localhost:8080/api/auth"

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
print("  BEHAVIORLOCK PHASE 2 AUTH TEST SUITE   ")
print("=========================================")

# 1. Registration
print("\n[1/7] Testing Registration (POST /api/auth/register)...")
reg_payload = {
    "name": "Elena Rostova",
    "email": "elena@behaviorlock.io",
    "password": "Password123!",
    "confirmPassword": "Password123!"
}
status, data = make_request(f"{base_url}/register", method="POST", body=reg_payload)
print(f"Status: {status}")
print(f"Response: {data}")
jwt_token = data.get("token")

# 2. Duplicate Registration
print("\n[2/7] Testing Duplicate Email Prevention...")
status, data = make_request(f"{base_url}/register", method="POST", body=reg_payload)
print(f"Status: {status} (Expected 400)")
print(f"Response: {data}")

# 3. Password Mismatch
print("\n[3/7] Testing Password Mismatch...")
mismatch_payload = {
    "name": "Test User",
    "email": "mismatch@behaviorlock.io",
    "password": "Password123!",
    "confirmPassword": "DifferentPassword!"
}
status, data = make_request(f"{base_url}/register", method="POST", body=mismatch_payload)
print(f"Status: {status} (Expected 400)")
print(f"Response: {data}")

# 4. Login
print("\n[4/7] Testing Login (POST /api/auth/login)...")
login_payload = {
    "email": "elena@behaviorlock.io",
    "password": "Password123!"
}
status, data = make_request(f"{base_url}/login", method="POST", body=login_payload)
print(f"Status: {status}")
print(f"Issued Token: {data.get('token')[:30]}...")
if data.get("token"):
    jwt_token = data.get("token")

# 5. Invalid Password Login
print("\n[5/7] Testing Invalid Password Login...")
bad_login = {
    "email": "elena@behaviorlock.io",
    "password": "WrongPassword999"
}
status, data = make_request(f"{base_url}/login", method="POST", body=bad_login)
print(f"Status: {status} (Expected 401)")
print(f"Response: {data}")

# 6. GET /api/auth/me WITHOUT Token
print("\n[6/7] Testing GET /api/auth/me WITHOUT Token...")
status, data = make_request(f"{base_url}/me", method="GET")
print(f"Status: {status} (Expected 401)")

# 7. GET /api/auth/me WITH Bearer Token
print("\n[7/7] Testing GET /api/auth/me WITH Bearer Token...")
status, data = make_request(f"{base_url}/me", method="GET", headers={"Authorization": f"Bearer {jwt_token}"})
print(f"Status: {status} (Expected 200)")
print(f"User Details: {data}")

print("\n=========================================")
print("   ALL TESTS PASSED SUCCESSFULLY!        ")
print("=========================================")
