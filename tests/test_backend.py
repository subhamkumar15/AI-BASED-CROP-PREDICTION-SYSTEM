"""
Automated Test Suite for AGRISENSE Backend and ML Inference
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["platform"] == "AGRISENSE"

def test_auth_login_admin():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@agrisense.ai", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_auth_login_farmer():
    response = client.post(
        "/api/auth/login",
        json={"email": "farmer@agrisense.ai", "password": "farmer123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "farmer"

def test_auth_login_invalid():
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@agrisense.ai", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_predict_presets():
    response = client.get("/api/predict/presets")
    assert response.status_code == 200
    presets = response.json()
    assert len(presets) >= 4
    assert any("punjab" in p["id"] for p in presets)

def test_predict_crops_list():
    response = client.get("/api/predict/crops-list")
    assert response.status_code == 200
    crops = response.json()
    assert len(crops) == 22
    assert any(c["key"] == "rice" for c in crops)

def test_predict_recommend_valid():
    payload = {
        "N": 85,
        "P": 45,
        "K": 40,
        "temperature": 27.5,
        "humidity": 82.0,
        "ph": 6.8,
        "rainfall": 210.0,
        "soil_type": "alluvial",
        "season": "Kharif",
        "region": "North India",
        "location_name": "Test Field 1"
    }
    response = client.post("/api/predict/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "crop" in data
    assert "suitability_score" in data
    assert "top_alternatives" in data
    assert len(data["top_alternatives"]) == 5
    assert "radar_data" in data
    assert "economics" in data

def test_predict_invalid_input_rejected():
    # pH outside allowable range (3.0 - 10.0)
    payload = {
        "N": 85,
        "P": 45,
        "K": 40,
        "temperature": 27.5,
        "humidity": 82.0,
        "ph": 14.5,
        "rainfall": 210.0
    }
    response = client.post("/api/predict/recommend", json=payload)
    assert response.status_code == 422  # Pydantic validation error

def test_soil_analysis():
    payload = {
        "N": 35.0,
        "P": 20.0,
        "K": 20.0,
        "ph": 5.2,
        "soil_moisture": 30.0
    }
    response = client.post("/api/soil/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overall_health_score" in data
    assert "fertilizer_recommendations" in data
    assert len(data["amendment_guidance"]) > 0

def test_weather_regions():
    response = client.get("/api/weather/regions")
    assert response.status_code == 200
    regions = response.json()
    assert len(regions) >= 10

def test_chat_assistant():
    payload = {"message": "What is the best fertilizer for nitrogen deficient soil?"}
    response = client.post("/api/chat/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "suggested_questions" in data
    assert "Urea" in data["reply"] or "Nitrogen" in data["reply"]

def test_admin_system_stats():
    response = client.get("/api/admin/system-stats")
    assert response.status_code == 200
    data = response.json()
    assert data["platform_name"] == "AGRISENSE Enterprise Precision Agriculture"
    assert "verified_metrics" in data
    assert data["verified_metrics"]["test_accuracy"] >= 0.95
