
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_campaigns_endpoint_requires_auth():
    response = client.get("/api/campaigns")
    assert response.status_code == 401

def test_campaigns_endpoint_with_auth():
    headers = {"Authorization": "Bearer mock_token"}
    response = client.get("/api/campaigns", headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert isinstance(response.json()["data"], list)

def test_create_campaign():
    headers = {"Authorization": "Bearer mock_token"}
    campaign_data = {
        "name": "Test Campaign",
        "type": "email",
        "description": "Test description"
    }
    response = client.post("/api/campaigns", json=campaign_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["name"] == "Test Campaign"

def test_leads_endpoint():
    headers = {"Authorization": "Bearer mock_token"}
    response = client.get("/api/leads", headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert isinstance(response.json()["data"], list)

def test_search_leads():
    headers = {"Authorization": "Bearer mock_token"}
    response = client.get("/api/leads/search?q=test", headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is True
