def register(client, email="bsv@example.com", password="secret123"):
    r = client.post("/api/auth/register", json={"name": "BSV", "email": email, "password": password})
    assert r.status_code == 201, r.text
    return r.json()["token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_register_login_and_me(client):
    token = register(client)
    assert client.get("/api/auth/me", headers=auth(token)).json()["email"] == "bsv@example.com"
    r = client.post("/api/auth/login", json={"email": "BSV@example.com", "password": "secret123"})
    assert r.status_code == 200 and r.json()["token"]


def test_duplicate_email_and_wrong_password(client):
    register(client)
    assert client.post("/api/auth/register", json={"name": "X", "email": "bsv@example.com", "password": "another123"}).status_code == 409
    assert client.post("/api/auth/login", json={"email": "bsv@example.com", "password": "nope12345"}).status_code == 401


def test_validation(client):
    r = client.post("/api/auth/register", json={"name": "A", "email": "not-an-email", "password": "short"})
    assert r.status_code == 422


def test_requires_token(client):
    assert client.get("/api/data").status_code == 401
    assert client.get("/api/data", headers=auth("garbage")).status_code == 401


def test_data_roundtrip_is_per_user(client):
    a = register(client, "a@example.com")
    b = register(client, "b@example.com")
    payload = {"progress": {"xp": 120, "cards": {"py-basics#0": {"box": 2}}}, "skills": {"skills": [{"id": "s1", "name": "Docker"}]}, "topics": {"s1-0": {"t": "Images"}}}
    assert client.put("/api/data", json=payload, headers=auth(a)).status_code == 200
    got = client.get("/api/data", headers=auth(a)).json()
    assert got["progress"]["xp"] == 120 and got["skills"]["skills"][0]["name"] == "Docker"
    assert client.get("/api/data", headers=auth(b)).json()["progress"] == {}


def test_profile_password_and_delete(client):
    token = register(client)
    assert client.patch("/api/auth/me", json={"name": "Sowmya"}, headers=auth(token)).json()["name"] == "Sowmya"
    assert client.post("/api/auth/change-password", json={"current_password": "wrong123", "new_password": "newpass123"}, headers=auth(token)).status_code == 400
    assert client.post("/api/auth/change-password", json={"current_password": "secret123", "new_password": "newpass123"}, headers=auth(token)).status_code == 204
    assert client.post("/api/auth/login", json={"email": "bsv@example.com", "password": "newpass123"}).status_code == 200
    assert client.delete("/api/auth/me", headers=auth(token)).status_code == 204
    assert client.get("/api/auth/me", headers=auth(token)).status_code == 401
