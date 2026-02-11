# 🏗️ Architecture Technique - EcoLearn AI

## Vue d'Ensemble

EcoLearn AI est construit sur une architecture microservices moderne, containerisée avec Docker et déployée sur AWS ECS. Cette architecture garantit scalabilité, résilience et maintenabilité.

## 1. Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET / USERS                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AWS Application Load Balancer                   │
│                    (HTTPS/SSL Termination)                       │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                   │
           │                                   │
    ┌──────▼──────────┐              ┌────────▼─────────┐
    │   Frontend      │              │    Backend        │
    │   Container     │              │    Container      │
    │   (React+Nginx) │◄─────────────┤    (FastAPI)     │
    │   Port: 80      │              │    Port: 8000     │
    └─────────────────┘              └────────┬──────────┘
                                              │
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     │                        │                        │
                     ▼                        ▼                        ▼
            ┌────────────────┐      ┌─────────────────┐     ┌─────────────────┐
            │   PostgreSQL   │      │   OpenAI API    │     │  Reforestation  │
            │   Database     │      │   (GPT-4)       │     │   API           │
            │   (RDS)        │      │   External      │     │   External      │
            └────────────────┘      └─────────────────┘     └─────────────────┘
```

## 2. Conteneurs Docker

### 2.1 Frontend Container (React + Nginx)

**Image**: `node:18-alpine` (build) → `nginx:alpine` (prod)

**Responsabilités**:
- Servir l'application React compilée
- Reverse proxy vers l'API backend
- Compression gzip des assets
- Headers de sécurité HTTP
- Caching statique

**Configuration**:
```nginx
- Port: 80
- Healthcheck: wget http://localhost/
- Resource limits: 256MB RAM, 0.25 CPU
```

**Build Multi-stage**:
1. Stage 1: Build React avec Vite
2. Stage 2: Copy build vers Nginx

### 2.2 Backend Container (FastAPI)

**Image**: `python:3.11-slim`

**Responsabilités**:
- API REST FastAPI
- Intégration OpenAI GPT
- Calcul empreinte carbone
- Gestion authentification JWT
- Interaction base de données

**Services**:
- **LearningService**: Génération contenu IA
- **CarbonService**: Calcul CO₂ + API reforestation
- **AuthService**: JWT, hashing mots de passe

**Configuration**:
```yaml
Port: 8000
Workers: 4 (Uvicorn)
Healthcheck: curl http://localhost:8000/health
Resource limits: 1GB RAM, 0.5 CPU
```

### 2.3 Database Container (PostgreSQL 15)

**Image**: `postgres:15-alpine`

**Configuration**:
```yaml
Port: 5432
Volume: postgres_data (persistant)
Backup: Daily automated snapshots
Replica: Read replica for analytics (production)
```

**Tables Principales**:
- users
- courses
- enrollments
- carbon_metrics
- tree_plantations
- achievements
- user_achievements

### 2.4 Monitoring (Prometheus + Grafana)

**Prometheus**:
- Collecte métriques applicatives
- Scrape interval: 15s
- Retention: 15 jours

**Grafana**:
- 3 dashboards pré-configurés
- Alerting intégré
- Visualisations temps réel

## 3. Schéma de Base de Données

```sql
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ name            │
│ hashed_password │
│ carbon_offset   │
│ trees_planted   │
│ level           │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐       N:1      ┌─────────────────┐
│  enrollments    │◄────────────────┤    courses      │
├─────────────────┤                 ├─────────────────┤
│ id (PK)         │                 │ id (PK)         │
│ user_id (FK)    │                 │ title           │
│ course_id (FK)  │                 │ category        │
│ progress        │                 │ content (JSON)  │
│ completed       │                 │ ai_generated    │
└─────────────────┘                 └─────────────────┘

         │
         │ 1:N
         ▼
┌─────────────────┐
│ carbon_metrics  │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ month           │
│ carbon_offset   │
│ trees_planted   │
└─────────────────┘
```

## 4. Services Backend

### 4.1 Learning Service (OpenAI Integration)

```python
class LearningService:
    - generate_course_content()
    - generate_personalized_recommendations()
    - generate_quiz()
```

**Workflow Génération de Cours**:
```
1. User Request → Topic, Difficulty, Duration
2. Build Prompt → Structured JSON format
3. OpenAI API Call → GPT-4 Turbo
4. Parse Response → Validate JSON schema
5. Store in DB → courses.content (JSON)
6. Return Course → With metadata
```

**Optimisations**:
- Caching des générations similaires
- Token limitation (4000 max)
- Retry logic avec backoff exponentiel
- Rate limiting OpenAI

### 4.2 Carbon Service

```python
class CarbonService:
    - calculate_carbon_footprint()
    - plant_trees_via_api()
    - get_reforestation_projects()
```

**Calcul Empreinte Carbone**:
```
Carbon (kg) = Learning Hours × Category Coefficient

Coefficients:
- IA: 0.35 kg CO₂/h (compute-intensive)
- Data Science: 0.32 kg CO₂/h
- Sustainability: 0.15 kg CO₂/h (optimisé)
- Business: 0.20 kg CO₂/h
- Default: 0.25 kg CO₂/h
```

**API Reforestation**:
- Tree-Nation API integration
- Transaction tracking
- Certificate generation
- Fallback simulation mode

## 5. Authentification & Sécurité

### 5.1 JWT Authentication

**Flow**:
```
1. POST /api/auth/token
2. Vérifier email/password
3. Générer JWT (exp: 24h)
4. Return: {"access_token": "eyJ...", "token_type": "bearer"}
5. Client stocke token
6. Requests: Header "Authorization: Bearer eyJ..."
```

**Token Structure**:
```json
{
  "sub": "user@email.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### 5.2 Sécurité Applicative

**Backend**:
- Bcrypt pour hashing mots de passe (cost: 12)
- JWT avec HS256
- CORS configuré (whitelist domaines)
- Rate limiting sur endpoints sensibles
- Input validation (Pydantic)
- SQL injection protection (SQLAlchemy ORM)

**Frontend**:
- XSS protection (React escape par défaut)
- CSRF tokens
- Content Security Policy headers
- HTTPS only (production)

**Infrastructure**:
- Secrets dans AWS Secrets Manager
- VPC privé pour base de données
- Security groups restrictifs
- WAF sur ALB (production)

## 6. Pipeline CI/CD

### Stage 1: BUILD
```yaml
Triggers: Push to main/develop
Steps:
  - Checkout code
  - Setup Python 3.11 + Node 18
  - Cache dependencies
  - Install deps (pip, npm)
  - Build frontend (Vite)
  - Upload artifacts
Duration: ~2 minutes
```

### Stage 2: TEST
```yaml
Parallel Execution:
  Backend:
    - pytest (unit + integration)
    - Coverage report (>80%)
    - Upload to Codecov
  Frontend:
    - vitest tests
    - Coverage report
Duration: ~3 minutes
```

### Stage 3: ANALYZE
```yaml
Quality Checks:
  - Flake8 (linting)
  - Black (code formatting)
  - MyPy (type checking)
  - Bandit (security scan)
  - Safety (dependencies)
  - SonarCloud (code quality)
Gate: Quality gate must pass
Duration: ~4 minutes
```

### Stage 4: DEPLOY
```yaml
Conditions: main branch + tests passed
Steps:
  - Login AWS ECR
  - Build Docker images
  - Tag: git-sha + latest
  - Push to ECR
  - Update ECS task definition
  - Deploy to ECS
  - Health checks
  - CloudWatch monitoring
Duration: ~8 minutes
Total Pipeline: ~17 minutes
```

## 7. Déploiement AWS ECS

### Infrastructure

**VPC Configuration**:
```
VPC: 10.0.0.0/16
Subnets:
  - Public 1: 10.0.1.0/24 (eu-west-1a)
  - Public 2: 10.0.2.0/24 (eu-west-1b)
  - Private 1: 10.0.10.0/24 (eu-west-1a)
  - Private 2: 10.0.11.0/24 (eu-west-1b)
```

**ECS Cluster**:
```
Type: Fargate
Capacity Providers: FARGATE, FARGATE_SPOT
Auto-scaling: Target tracking (CPU 70%)
Min tasks: 2
Max tasks: 10
```

**RDS PostgreSQL**:
```
Instance: db.t3.medium
Storage: 100GB GP3 (auto-scaling)
Multi-AZ: Yes (production)
Backups: Daily, retention 7 days
Encryption: AES-256
```

### Scaling Strategy

**Horizontal Scaling**:
- Metric: CPU > 70% → Scale out
- Metric: CPU < 30% → Scale in
- Cooldown: 300 seconds

**Vertical Scaling** (manuel):
- Upgrade task CPU/Memory
- Upgrade RDS instance class

## 8. Monitoring & Observabilité

### Métriques Clés

**Application**:
- Request rate (req/s)
- Response time (P50, P95, P99)
- Error rate (%)
- Active users
- Courses generated
- Carbon offset total

**Infrastructure**:
- CPU utilization (%)
- Memory utilization (%)
- Network I/O
- Database connections
- Disk IOPS

### Alerting

**Critical Alerts** (PagerDuty):
- Error rate > 5%
- Response time P95 > 2s
- Database CPU > 90%
- Service health check failed

**Warning Alerts** (Slack):
- Error rate > 2%
- CPU > 80%
- Memory > 80%
- Disk > 85%

### Logging

**Structure**:
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "service": "backend",
  "user_id": 123,
  "endpoint": "/api/courses",
  "duration_ms": 45,
  "status_code": 200
}
```

**Retention**:
- CloudWatch: 30 jours
- S3 Archive: 1 an
- Critical logs: Permanent

## 9. Performance & Optimisation

### Backend

**Optimisations**:
- Database connection pooling (max: 20)
- Query optimization (indexes)
- Async/await pour I/O
- Caching Redis (optionnel)
- Response compression (gzip)

**Benchmarks**:
- GET /api/courses: ~50ms
- POST /api/ai/generate-course: ~3-5s
- POST /api/auth/token: ~100ms

### Frontend

**Optimisations**:
- Code splitting (Vite)
- Lazy loading routes
- Image optimization
- Asset caching (1 year)
- Bundle size < 500KB

**Performance**:
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Lighthouse Score: > 90

## 10. Disaster Recovery

**RTO** (Recovery Time Objective): 1 heure
**RPO** (Recovery Point Objective): 5 minutes

**Stratégie**:
1. Database: Point-in-time recovery (5 min)
2. Application: Blue/green deployment
3. Backups: Multi-region S3 replication
4. Runbooks: Documented procedures

---

**Document Version**: 1.0.0  
**Dernière mise à jour**: Février 2024  
**Auteur**: EcoLearn DevOps Team
