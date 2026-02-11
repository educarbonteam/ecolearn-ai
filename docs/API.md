# 📚 EcoLearn AI - Documentation API

## Base URL
```
Development: http://localhost:8000
Production:  https://api.ecolearn.ai
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "JD",
  "level": "Éco-Apprenant Débutant",
  "total_learning_hours": 0.0,
  "courses_completed": 0,
  "carbon_offset": 0.0,
  "trees_planted": 0,
  "streak": 0,
  "created_at": "2024-01-01T12:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Email already registered

---

### Login
Authenticate and receive access token.

**Endpoint**: `POST /api/auth/token`

**Request Body** (form-data):
```
username: user@example.com
password: securePassword123
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors**:
- `401 Unauthorized`: Incorrect credentials

---

### Get Current User
Get authenticated user information.

**Endpoint**: `GET /api/auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "JD",
  "level": "Éco-Apprenant Expert",
  "total_learning_hours": 47.5,
  "courses_completed": 12,
  "carbon_offset": 142.8,
  "trees_planted": 28,
  "streak": 15,
  "created_at": "2024-01-01T12:00:00Z"
}
```

---

## 🤖 AI Course Generation

### Generate Course with AI
Generate personalized course content using OpenAI GPT.

**Endpoint**: `POST /api/ai/generate-course`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "topic": "Machine Learning pour l'Écologie",
  "difficulty": "Intermédiaire",
  "duration": "6h",
  "focus_areas": ["Conservation", "Analyse de données"]
}
```

**Response**: `200 OK`
```json
{
  "course": {
    "id": 5,
    "title": "Machine Learning pour la Conservation de la Biodiversité",
    "description": "Apprenez à utiliser le ML pour protéger les espèces...",
    "category": "Machine",
    "duration": "6h",
    "difficulty": "Intermédiaire",
    "modules": 12,
    "instructor": "AI Generated",
    "carbon_impact": 21.5,
    "ai_generated": true,
    "created_at": "2024-01-01T12:00:00Z"
  },
  "content": {
    "title": "Machine Learning pour la Conservation de la Biodiversité",
    "description": "Un cours complet...",
    "objectives": [
      "Comprendre les applications du ML en écologie",
      "Maîtriser les algorithmes de classification",
      "Analyser des données environnementales"
    ],
    "modules": [
      {
        "id": 1,
        "title": "Introduction au ML Écologique",
        "duration": "45min",
        "content": "Le machine learning révolutionne...",
        "exercises": ["Quiz: Concepts de base", "Exercice pratique"],
        "sustainability_note": "Optimisation énergétique des modèles"
      }
    ],
    "resources": ["Documentation scikit-learn", "Papers de recherche"],
    "final_project": "Créer un modèle de prédiction...",
    "estimated_carbon_impact": 21.5
  },
  "generation_metadata": {
    "model": "gpt-4-turbo",
    "tokens_used": 3245,
    "difficulty": "Intermédiaire",
    "requested_duration": "6h"
  }
}
```

---

## 📚 Courses

### List Courses
Get paginated list of available courses.

**Endpoint**: `GET /api/courses`

**Query Parameters**:
- `skip`: int (default: 0)
- `limit`: int (default: 20, max: 100)
- `category`: string (optional)

**Example**: `GET /api/courses?skip=0&limit=10&category=Intelligence%20Artificielle`

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "title": "Introduction à l'IA Responsable",
    "category": "Intelligence Artificielle",
    "difficulty": "Débutant",
    "duration": "4h 30min",
    "modules": 8,
    "instructor": "Dr. Marie Dubois",
    "carbon_impact": 12.4,
    "enrolled_count": 1247,
    "rating": 4.8,
    "ai_generated": false,
    "created_at": "2024-01-01T12:00:00Z"
  }
]
```

---

### Get Course Details
Get detailed information about a specific course.

**Endpoint**: `GET /api/courses/{course_id}`

**Response**: `200 OK`
```json
{
  "id": 1,
  "title": "Introduction à l'IA Responsable",
  "description": "Ce cours explore les fondamentaux...",
  "category": "Intelligence Artificielle",
  "duration": "4h 30min",
  "difficulty": "Débutant",
  "modules": 8,
  "instructor": "Dr. Marie Dubois",
  "carbon_impact": 12.4,
  "enrolled_count": 1247,
  "rating": 4.8,
  "ai_generated": false,
  "created_at": "2024-01-01T12:00:00Z"
}
```

**Errors**:
- `404 Not Found`: Course not found

---

### Enroll in Course
Enroll the authenticated user in a course.

**Endpoint**: `POST /api/courses/{course_id}/enroll`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": 1,
  "course_id": 1,
  "progress": 0.0,
  "completed": false,
  "started_at": "2024-01-01T12:00:00Z",
  "last_accessed": "2024-01-01T12:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Already enrolled
- `404 Not Found`: Course not found

---

### Get My Courses
Get all courses the user is enrolled in.

**Endpoint**: `GET /api/my-courses`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "course_id": 1,
    "progress": 75.0,
    "completed": false,
    "started_at": "2024-01-01T12:00:00Z",
    "last_accessed": "2024-01-15T10:30:00Z",
    "course": {
      "id": 1,
      "title": "Introduction à l'IA Responsable",
      "category": "Intelligence Artificielle",
      "duration": "4h 30min"
    }
  }
]
```

---

### Update Course Progress
Update progress for an enrollment.

**Endpoint**: `PATCH /api/enrollments/{enrollment_id}/progress`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `progress`: float (0-100)

**Example**: `PATCH /api/enrollments/1/progress?progress=85.5`

**Response**: `200 OK`
```json
{
  "message": "Progress updated",
  "progress": 85.5
}
```

---

## 🌍 Carbon & Impact

### Calculate Carbon Footprint
Calculate carbon footprint for learning activity.

**Endpoint**: `POST /api/carbon/calculate`

**Request Body**:
```json
{
  "learning_hours": 5.0,
  "course_category": "Intelligence Artificielle"
}
```

**Response**: `200 OK`
```json
{
  "carbon_offset_kg": 1.75,
  "trees_equivalent": 1,
  "car_km_equivalent": 14.58,
  "coefficient_used": 0.35,
  "category": "Intelligence Artificielle",
  "calculation_method": "learning_hours * category_coefficient"
}
```

---

### Get Carbon Metrics
Get user's carbon metrics history.

**Endpoint**: `GET /api/carbon/metrics`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "month": "Jan",
    "year": 2024,
    "carbon_offset": 25.0,
    "trees_planted": 5,
    "learning_hours": 12.5,
    "created_at": "2024-01-31T23:59:59Z"
  }
]
```

---

### Plant Trees
Plant trees via reforestation API.

**Endpoint**: `POST /api/trees/plant`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "trees_count": 10,
  "location": "Amazonie"
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "trees_count": 10,
  "location": "Amazonie",
  "organization": "Tree-Nation",
  "status": "confirmed",
  "carbon_equivalent": 5.96,
  "planted_at": "2024-01-01T12:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid trees_count

---

### Get Reforestation Projects
Get available reforestation projects.

**Endpoint**: `GET /api/trees/projects`

**Response**: `200 OK`
```json
{
  "projects": [
    {
      "id": "amazon_restoration",
      "name": "Restoration de la Forêt Amazonienne",
      "location": "Brésil",
      "trees_available": 50000,
      "cost_per_tree": 1.5,
      "co2_per_tree": 21.77,
      "image": "https://example.com/amazon.jpg"
    }
  ]
}
```

---

## 📊 Dashboard & Statistics

### Get User Dashboard
Get comprehensive dashboard data for the user.

**Endpoint**: `GET /api/dashboard`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "level": "Éco-Apprenant Expert",
    "total_learning_hours": 47.5,
    "courses_completed": 12,
    "carbon_offset": 142.8,
    "trees_planted": 28,
    "streak": 15
  },
  "recent_courses": [
    {
      "id": 1,
      "course_id": 1,
      "progress": 75.0,
      "completed": false,
      "course": {
        "title": "Introduction à l'IA Responsable"
      }
    }
  ],
  "carbon_evolution": [
    {
      "month": "Jan",
      "year": 2024,
      "carbon_offset": 25.0,
      "trees_planted": 5
    }
  ],
  "achievements": [
    {
      "id": 1,
      "name": "Planteur d'Arbres",
      "description": "25 arbres plantés",
      "unlocked": true,
      "unlocked_at": "2024-01-15T10:00:00Z"
    }
  ],
  "learning_stats": {
    "total_hours": 47.5,
    "courses_completed": 12,
    "current_streak": 15,
    "level": "Éco-Apprenant Expert"
  }
}
```

---

### Get Platform Statistics
Get platform-wide statistics.

**Endpoint**: `GET /api/stats/platform`

**Response**: `200 OK`
```json
{
  "total_users": 15847,
  "total_courses": 234,
  "total_carbon_offset": 52341.8,
  "total_trees_planted": 10468,
  "active_learners": 8923
}
```

---

## ❤️ Health Check

### Health Check
Check if the API is healthy.

**Endpoint**: `GET /health`

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "service": "ecolearn-api",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

## Rate Limiting

**Limits**:
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- AI Generation: 10 requests/hour

**Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Interactive Documentation

For interactive API documentation with try-it-out features:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

**Version**: 1.0.0  
**Last Updated**: February 2024
