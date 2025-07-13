"""
Tests for keyword research functionality
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
import json

from backend.main import app

client = TestClient(app)

@pytest.fixture
def mock_auth_token():
    """Mock authentication token"""
    return {"sub": "test-user-id", "email": "test@example.com"}

@pytest.fixture
def sample_keywords_payload():
    """Sample keyword research payload"""
    return {
        "seed_keywords": ["marketing", "automation"],
        "location": "US",
        "industry": "marketing"
    }

@pytest.fixture
def sample_competitor_payload():
    """Sample competitor analysis payload"""
    return {
        "competitor_domain": "example.com"
    }

class TestKeywordResearch:
    """Test keyword research endpoints"""
    
    def test_research_keywords_success(self, sample_keywords_payload):
        """Test successful keyword research"""
        with patch('backend.routes.keyword_research.verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "test-user-id"}
            
            response = client.post(
                "/api/keywords/research",
                json=sample_keywords_payload,
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "keywords" in data["data"]
            assert "total_keywords" in data["data"]
    
    def test_research_keywords_missing_seeds(self):
        """Test keyword research with missing seed keywords"""
        with patch('backend.routes.keyword_research.verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "test-user-id"}
            
            response = client.post(
                "/api/keywords/research",
                json={"location": "US"},
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code == 422  # Validation error
    
    def test_competitor_keywords_success(self, sample_competitor_payload):
        """Test successful competitor keyword analysis"""
        with patch('backend.routes.keyword_research.verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "test-user-id"}
            
            response = client.post(
                "/api/keywords/competitor",
                json=sample_competitor_payload,
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "keywords" in data["data"]
    
    def test_trending_keywords_success(self):
        """Test successful trending keywords request"""
        with patch('backend.routes.keyword_research.verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "test-user-id"}
            
            response = client.post(
                "/api/keywords/trending",
                json={"industry": "marketing"},
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "keywords" in data["data"]
    
    def test_keyword_history_success(self):
        """Test getting keyword research history"""
        with patch('backend.routes.keyword_research.verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "test-user-id"}
            
            response = client.get(
                "/api/keywords/history",
                headers={"Authorization": "Bearer test-token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_unauthorized_access(self):
        """Test unauthorized access to keyword research"""
        response = client.post(
            "/api/keywords/research",
            json={"seed_keywords": ["test"]}
        )
        
        # Should fail without authentication
        assert response.status_code == 422  # FastAPI validation error for missing dependency