from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from main import app
import pytest

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword123",
            "first_name": "Test",
            "last_name": "User"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert data["is_active"] is True
    assert data["is_verified"] is False

    # Try duplicate registration
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword123"
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_and_me():
    # Login
    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "strongpassword123"
        },
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Get Me
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_verify_email():
    # We need a token. Let's cheat and generate one or register a user and intercept...
    # Actually, simpler is to just generate one using the security module since we have the secret key in env (loaded by app)
    from app.core import security
    from datetime import timedelta
    
    token = security.create_access_token(subject="test@example.com", expires_delta=timedelta(hours=1))
    
    response = client.post(f"/auth/verify-email?token={token}")
    assert response.status_code == 200
    assert response.json()["message"] == "Email verified successfully"
    
    # Check if verified
    # Login again to check verification status (need to inspect response or DB)
    # The 'me' endpoint returns is_verified
    
    # Login
    login_res = client.post("/auth/login", json={"email": "test@example.com", "password": "strongpassword123"})
    token_str = login_res.json()["access_token"]
    
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token_str}"})
    assert me_res.json()["is_verified"] is True
