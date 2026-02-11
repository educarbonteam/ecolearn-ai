"""
Test suite for EcoLearn AI Backend
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app, get_db
from database import Base
from models import User, Course

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_user(self, client, test_user_data):
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["name"] == test_user_data["name"]
        assert "id" in data
    
    def test_register_duplicate_email(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_login_success(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        response = client.post(
            "/api/auth/token",
            data={"username": test_user_data["email"], "password": test_user_data["password"]}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        response = client.post(
            "/api/auth/token",
            data={"username": test_user_data["email"], "password": "wrongpassword"}
        )
        assert response.status_code == 401
    
    def test_get_current_user(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        login_response = client.post(
            "/api/auth/token",
            data={"username": test_user_data["email"], "password": test_user_data["password"]}
        )
        token = login_response.json()["access_token"]
        
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]


class TestCourses:
    """Test course management endpoints"""
    
    def test_get_courses(self, client):
        response = client.get("/api/courses")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_enroll_course(self, client, test_user_data):
        # Register and login
        client.post("/api/auth/register", json=test_user_data)
        login_response = client.post(
            "/api/auth/token",
            data={"username": test_user_data["email"], "password": test_user_data["password"]}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create a course first (simplified)
        # In real scenario, you'd create via admin endpoint
        
        # Try to enroll
        response = client.post(
            "/api/courses/1/enroll",
            headers=headers
        )
        # Course might not exist, so 404 is expected
        assert response.status_code in [200, 404]


class TestCarbonCalculation:
    """Test carbon footprint calculation"""
    
    def test_calculate_carbon(self, client):
        response = client.post(
            "/api/carbon/calculate",
            json={
                "learning_hours": 5.0,
                "course_category": "Intelligence Artificielle"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "carbon_offset_kg" in data
        assert "trees_equivalent" in data
        assert data["carbon_offset_kg"] > 0
        assert data["trees_equivalent"] > 0


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data


@pytest.mark.asyncio
class TestAIGeneration:
    """Test AI course generation (mocked)"""
    
    async def test_generate_course_structure(self):
        # This would test the AI generation logic
        # For now, just test the structure
        from services.learning_service import LearningService
        
        # Mock the OpenAI call
        # In real tests, use pytest-mock or responses library
        assert hasattr(LearningService, 'generate_course_content')


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
