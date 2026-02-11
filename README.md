# 🌱 EcoLearn AI - Plateforme d'Apprentissage Éco-Responsable

[![CI/CD Pipeline](https://github.com/your-org/ecolearn-ai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/ecolearn-ai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

Plateforme d'apprentissage intelligente propulsée par l'IA avec suivi d'impact environnemental en temps réel et programme de reforestation intégré.

## 📋 Table des Matières

- [Vue d'Ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation Locale](#-installation-locale)
- [Déploiement Production](#-déploiement-production)
- [API Documentation](#-api-documentation)
- [Tests](#-tests)
- [Monitoring](#-monitoring)
- [CI/CD Pipeline](#-cicd-pipeline)

## 🎯 Vue d'Ensemble

EcoLearn AI est une plateforme d'apprentissage nouvelle génération qui combine :

- **🤖 IA Générative** : Génération de contenu pédagogique adaptatif via OpenAI GPT
- **🌍 Impact Environnemental** : Calcul temps réel de l'empreinte carbone
- **🌳 Reforestation** : Programme de plantation d'arbres intégré
- **📊 Analytics** : Dashboard interactif avec visualisations D3.js
- **🔒 Sécurité** : Authentification JWT, chiffrement des données

### Fonctionnalités Principales

✅ Génération de cours personnalisés par IA  
✅ Suivi de progression en temps réel  
✅ Calcul automatique de l'empreinte carbone  
✅ Plantation d'arbres via API externe  
✅ Dashboard utilisateur avec métriques détaillées  
✅ Système d'achievements et gamification  
✅ Recommandations IA personnalisées  

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - Interface utilisateur responsive                          │
│  - Visualisations D3.js (Recharts)                          │
│  - État global avec Context API                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Learning   │  │   Carbon     │  │   Auth       │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  │  (OpenAI)    │  │  (Calcul +   │  │   (JWT)      │      │
│  │              │  │   Tree API)  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  - Utilisateurs, Cours, Enrollments                         │
│  - Métriques carbone, Plantations                           │
│  - Achievements, Analytics                                   │
└─────────────────────────────────────────────────────────────┘
```

### Conteneurs Docker

```yaml
1. ecolearn_frontend  : React + Nginx       (Port 3000)
2. ecolearn_backend   : FastAPI + Uvicorn   (Port 8000)
3. ecolearn_db        : PostgreSQL 15       (Port 5432)
4. prometheus         : Monitoring          (Port 9090)
5. grafana            : Visualisations      (Port 3001)
```

## 🛠️ Technologies

### Backend
- **FastAPI** 0.109.0 - Framework web moderne et performant
- **SQLAlchemy** 2.0.25 - ORM pour PostgreSQL
- **OpenAI** 1.10.0 - Génération de contenu IA
- **Pydantic** 2.5.3 - Validation de données
- **Python-Jose** 3.3.0 - Gestion JWT
- **Pytest** 7.4.4 - Tests unitaires et d'intégration

### Frontend
- **React** 18.2.0 - Framework UI
- **Recharts** 2.10.3 - Visualisations D3.js
- **Lucide React** - Icônes modernes
- **Vite** 5.0.11 - Build tool ultra-rapide
- **Axios** 1.6.5 - Client HTTP

### Infrastructure
- **Docker** & **Docker Compose** - Containerisation
- **PostgreSQL** 15 - Base de données relationnelle
- **Nginx** - Reverse proxy et serveur statique
- **Prometheus** - Métriques et monitoring
- **Grafana** - Tableaux de bord

### DevOps & CI/CD
- **GitHub Actions** - Pipeline CI/CD automatisé
- **AWS ECS** - Orchestration de conteneurs
- **AWS ECR** - Registry Docker privé
- **CloudWatch** - Logs et monitoring
- **SonarCloud** - Analyse de code
- **Codecov** - Couverture de tests

## 📦 Prérequis

### Développement Local
```bash
- Docker 24.0+ et Docker Compose 2.0+
- Node.js 18+ (pour développement frontend)
- Python 3.11+ (pour développement backend)
- Git
- Compte OpenAI API (clé API)
```

### Production AWS
```bash
- Compte AWS avec permissions ECS, ECR, RDS
- AWS CLI configuré
- Secrets Manager pour clés API
- Domaine et certificat SSL (optionnel)
```

## 🚀 Installation Locale

### 1. Cloner le Repository

```bash
git clone https://github.com/your-org/ecolearn-ai.git
cd ecolearn-ai
```

### 2. Configuration des Variables d'Environnement

```bash
cp .env.example .env
```

Éditez `.env` et remplissez vos clés API :

```env
OPENAI_API_KEY=sk-your-key-here
SECRET_KEY=$(openssl rand -base64 32)
TREE_API_KEY=your-tree-api-key
```

### 3. Lancer avec Docker Compose

```bash
# Construire et démarrer tous les services
docker-compose up --build

# En arrière-plan
docker-compose up -d
```

### 4. Accéder aux Services

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **API Docs** : http://localhost:8000/docs
- **Prometheus** : http://localhost:9090
- **Grafana** : http://localhost:3001 (admin/admin)

### 5. Créer un Utilisateur de Test

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ecolearn.ai",
    "name": "Test User",
    "password": "testpassword123"
  }'
```

## 🌐 Déploiement Production

### Option 1 : Déploiement AWS Automatisé

```bash
# 1. Configurer AWS CLI
aws configure

# 2. Exécuter le script de déploiement
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh
```

### Option 2 : Via GitHub Actions (Recommandé)

1. **Configurer les Secrets GitHub** :
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   OPENAI_API_KEY
   SONAR_TOKEN
   ```

2. **Pousser vers main** :
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

3. **Le pipeline s'exécute automatiquement** :
   - ✅ Build des images Docker
   - ✅ Tests automatisés (pytest)
   - ✅ Analyse de code (SonarCloud)
   - ✅ Déploiement AWS ECS
   - ✅ Configuration monitoring CloudWatch

### Architecture AWS ECS

```
Internet
    ↓
Application Load Balancer (ALB)
    ↓
┌─────────────────────────────┐
│  ECS Cluster (Fargate)      │
│  ┌─────────┐  ┌──────────┐ │
│  │Frontend │  │ Backend  │ │
│  │Container│  │Container │ │
│  └─────────┘  └──────────┘ │
└─────────────────────────────┘
          ↓
    RDS PostgreSQL
```

## 📚 API Documentation

### Authentification

#### Inscription
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

#### Connexion
```bash
POST /api/auth/token
form-data:
  username: user@example.com
  password: securepassword
```

### Génération de Cours IA

```bash
POST /api/ai/generate-course
Authorization: Bearer <token>
{
  "topic": "Machine Learning pour l'Écologie",
  "difficulty": "Intermédiaire",
  "duration": "6h",
  "focus_areas": ["Conservation", "Analyse de données"]
}
```

### Calcul Empreinte Carbone

```bash
POST /api/carbon/calculate
{
  "learning_hours": 5.0,
  "course_category": "Intelligence Artificielle"
}
```

### Plantation d'Arbres

```bash
POST /api/trees/plant
Authorization: Bearer <token>
{
  "trees_count": 10,
  "location": "Amazonie"
}
```

**Documentation Complète** : http://localhost:8000/docs (Swagger UI)

## 🧪 Tests

### Tests Backend

```bash
# Tous les tests
cd backend
pytest -v

# Avec couverture
pytest --cov=. --cov-report=html

# Tests spécifiques
pytest tests/test_api.py -k "test_authentication"
```

### Tests Frontend

```bash
cd frontend
npm test

# Avec couverture
npm test -- --coverage
```

### Tests d'Intégration

```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📊 Monitoring

### Métriques Prometheus

Métriques disponibles :
- `http_requests_total` - Nombre total de requêtes HTTP
- `http_request_duration_seconds` - Durée des requêtes
- `carbon_offset_total` - CO₂ total compensé
- `trees_planted_total` - Arbres plantés
- `active_users` - Utilisateurs actifs

### Dashboards Grafana

Accédez à http://localhost:3001 :

1. **Application Metrics** : Performance API, latence, erreurs
2. **Business Metrics** : Utilisateurs, cours, impact carbone
3. **Infrastructure** : CPU, mémoire, réseau
4. **Database** : Connexions, queries, performance

### CloudWatch (Production)

```bash
# Visualiser les logs
aws logs tail /ecs/ecolearn-backend --follow

# Métriques ECS
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=ecolearn-service \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

## 🔄 CI/CD Pipeline

### Pipeline GitHub Actions (4 Stages)

```yaml
1. BUILD
   - Installation dépendances
   - Build frontend React
   - Packaging backend
   - Cache optimisation

2. TEST
   - Tests unitaires (pytest)
   - Tests frontend (vitest)
   - Couverture de code
   - Upload vers Codecov

3. ANALYZE
   - Flake8 (linting)
   - Black (formatting)
   - MyPy (type checking)
   - Bandit (sécurité)
   - SonarCloud (qualité)

4. DEPLOY
   - Build images Docker
   - Push vers AWS ECR
   - Deploy AWS ECS
   - Monitoring CloudWatch
```

### Stratégie de Branches

```
main        → Production (auto-deploy)
develop     → Staging (auto-deploy)
feature/*   → PR review required
hotfix/*    → Fast-track to main
```

## 🔐 Sécurité

- ✅ Authentification JWT avec expiration
- ✅ Mots de passe hashés (bcrypt)
- ✅ HTTPS en production
- ✅ CORS configuré
- ✅ Secrets dans AWS Secrets Manager
- ✅ Scan de vulnérabilités (Bandit, Safety)
- ✅ Headers de sécurité HTTP

## 📈 Performance

- ⚡ Temps de réponse API < 200ms (médiane)
- ⚡ Build frontend < 30s
- ⚡ Tests complets < 2 min
- ⚡ Déploiement complet < 10 min

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir [LICENSE](LICENSE)

## 👥 Auteurs

- **EcoLearn Team** - [GitHub](https://github.com/your-org)

## 🙏 Remerciements

- OpenAI pour l'API GPT
- Tree-Nation pour l'API de reforestation
- La communauté open-source

---

**🌍 Ensemble, apprenons pour un avenir plus vert ! 🌱**
