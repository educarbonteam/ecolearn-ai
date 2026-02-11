# 📁 Structure Complète du Projet - EcoLearn AI

## Vue d'Ensemble

```
ecolearn-ai-platform/
│
├── 📄 START_HERE.md                    ← COMMENCEZ ICI !
├── 📄 README.md                        ← Documentation principale
├── 📄 docker-compose.yml               ← Orchestration des conteneurs
├── 📄 .env.example                     ← Template configuration
├── 📄 Makefile                         ← Commandes simplifiées
├── 📄 quick-start.sh                   ← Script démarrage automatique
├── 📄 .gitignore                       ← Fichiers à ignorer Git
├── 📄 sonar-project.properties         ← Configuration SonarCloud
│
├── 📁 backend/                         ← API FastAPI
│   ├── main.py                        ← Application principale
│   ├── database.py                    ← Configuration PostgreSQL
│   ├── models.py                      ← Modèles SQLAlchemy (7 tables)
│   ├── schemas.py                     ← Schémas Pydantic validation
│   ├── requirements.txt               ← Dépendances Python
│   ├── Dockerfile                     ← Image Docker backend
│   │
│   ├── 📁 services/                   ← Services métier
│   │   ├── __init__.py
│   │   ├── learning_service.py       ← Service OpenAI GPT
│   │   └── carbon_service.py         ← Service Carbon + Reforestation
│   │
│   └── 📁 tests/                      ← Tests unitaires
│       ├── __init__.py
│       └── test_api.py               ← Tests pytest (>80% couverture)
│
├── 📁 frontend/                        ← Application React
│   ├── index.html                     ← Point d'entrée HTML
│   ├── package.json                   ← Dépendances Node.js
│   ├── vite.config.js                 ← Configuration Vite
│   ├── Dockerfile                     ← Image Docker frontend
│   ├── nginx.conf                     ← Configuration Nginx
│   │
│   └── 📁 src/                        ← Code source React
│       ├── main.jsx                   ← Point d'entrée React
│       ├── App.jsx                    ← Composant principal (4000+ lignes)
│       └── index.css                  ← Styles de base
│
├── 📁 infra/                           ← Infrastructure & DevOps
│   ├── init.sql                       ← Script init PostgreSQL
│   │
│   └── 📁 prometheus/                 ← Configuration Prometheus
│       └── prometheus.yml            ← Config monitoring
│
├── 📁 .github/                         ← CI/CD GitHub Actions
│   └── 📁 workflows/
│       └── ci-cd.yml                 ← Pipeline 4 stages
│
├── 📁 .aws/                            ← Configuration AWS
│   └── task-definition.json          ← ECS Task Definition
│
├── 📁 scripts/                         ← Scripts utilitaires
│   └── deploy-aws.sh                 ← Déploiement AWS automatisé
│
└── 📁 docs/                            ← Documentation
    ├── ARCHITECTURE.md                ← Architecture technique détaillée
    └── API.md                         ← Documentation API complète
```

---

## 📋 Description Détaillée par Dossier

### 📁 `/backend` - API FastAPI (Cœur du Système)

**Responsabilité** : API REST, logique métier, intégration IA et base de données

#### Fichiers Principaux :

**`main.py` (600+ lignes)** :
- 15+ endpoints REST API
- Authentification JWT
- CORS middleware
- Health checks
- Routes :
  - `/api/auth/*` - Authentification
  - `/api/ai/*` - Génération IA
  - `/api/courses/*` - Gestion cours
  - `/api/carbon/*` - Calcul empreinte
  - `/api/trees/*` - Plantation arbres
  - `/api/dashboard` - Dashboard utilisateur

**`models.py` (200+ lignes)** :
- 7 tables SQLAlchemy :
  1. `users` - Comptes utilisateurs
  2. `courses` - Catalogue cours
  3. `enrollments` - Inscriptions
  4. `carbon_metrics` - Métriques CO₂ mensuelles
  5. `tree_plantations` - Historique plantations
  6. `achievements` - Badges disponibles
  7. `user_achievements` - Déblocages
- Relations ORM complètes
- Indexes optimisés

**`schemas.py` (300+ lignes)** :
- Validation Pydantic
- Request/Response models
- Schémas pour tous les endpoints

**`database.py`** :
- Configuration SQLAlchemy
- Connection pooling
- Session management

#### 📁 `/backend/services` - Services Métier

**`learning_service.py` (250+ lignes)** :
```python
Fonctions principales :
├── generate_course_content()           # Génération cours IA
├── generate_personalized_recommendations()  # Recommandations
└── generate_quiz()                     # Génération quiz

Intégration OpenAI GPT-4:
- Prompts structurés
- Validation JSON
- Gestion erreurs
- Metadata génération
```

**`carbon_service.py` (200+ lignes)** :
```python
Fonctions principales :
├── calculate_carbon_footprint()        # Calcul CO₂
├── plant_trees_via_api()              # API reforestation
├── get_reforestation_projects()       # Projets disponibles
└── calculate_platform_impact()        # Impact global

Coefficients CO₂:
- IA: 0.35 kg/h
- Data Science: 0.32 kg/h
- Sustainability: 0.15 kg/h
- Business: 0.20 kg/h
```

#### 📁 `/backend/tests` - Tests Automatisés

**`test_api.py` (150+ lignes)** :
- Tests authentification
- Tests génération IA
- Tests courses
- Tests carbon
- Couverture >80%

---

### 📁 `/frontend` - Application React

**Responsabilité** : Interface utilisateur, visualisations, interactions

#### Fichiers Principaux :

**`src/App.jsx` (4160 lignes !)** :
```javascript
Composants principaux :
├── App                         # Conteneur principal
├── AuthModal                   # Authentification
├── LandingContent             # Page d'accueil
├── DashboardView              # Dashboard utilisateur
├── GenerateCourseView         # Générateur IA
├── CoursesView                # Liste cours
├── ImpactView                 # Impact environnemental
└── ProfileView                # Profil utilisateur

Features :
- Recharts (D3.js) pour graphiques
- Lucide React pour icônes
- State management React hooks
- Responsive design
- Animations CSS
- Style intégré (3000+ lignes CSS)
```

**`package.json`** :
```json
Dépendances principales :
├── react@18.2.0
├── recharts@2.10.3          // Graphiques
├── lucide-react@0.263.1     // Icônes
├── axios@1.6.5              // HTTP client
└── vite@5.0.11              // Build tool
```

**`vite.config.js`** :
- Configuration build
- Proxy API vers backend
- Optimisations production

**`nginx.conf`** :
- Reverse proxy
- Compression gzip
- Headers sécurité
- Routing SPA
- Cache statique

---

### 📁 `/infra` - Infrastructure

**`init.sql` (150+ lignes)** :
```sql
Contenu :
├── Extensions PostgreSQL
├── Indexes optimisés
├── Achievements par défaut
├── Cours de démonstration
├── Vue platform_stats
├── Fonction update_user_level()
├── Trigger automatique
└── Permissions
```

**`prometheus/prometheus.yml`** :
- Configuration scraping
- Métriques backend
- Targets monitoring
- Alerting rules

---

### 📁 `.github/workflows` - CI/CD

**`ci-cd.yml` (400+ lignes)** :

**STAGE 1 - BUILD (~2 min)** :
```yaml
├── Checkout code
├── Setup Python 3.11 + Node 18
├── Cache dependencies
├── Build frontend (Vite)
└── Upload artifacts
```

**STAGE 2 - TEST (~3 min)** :
```yaml
├── PostgreSQL test database
├── pytest backend
├── Coverage report
├── Upload Codecov
└── Frontend tests
```

**STAGE 3 - ANALYZE (~4 min)** :
```yaml
├── Flake8 linting
├── Black formatting
├── MyPy type checking
├── Bandit security
├── Safety dependencies
└── SonarCloud scan
```

**STAGE 4 - DEPLOY (~8 min)** :
```yaml
├── AWS credentials
├── Login ECR
├── Build Docker images
├── Push to ECR
├── Update ECS
├── Deploy to production
└── CloudWatch setup
```

**Total : ~17 minutes**

---

### 📁 `.aws` - Configuration AWS

**`task-definition.json`** :
```json
ECS Fargate Task:
├── Backend container
│   ├── Image: ECR
│   ├── Port: 8000
│   ├── Secrets Manager
│   └── CloudWatch logs
│
└── Frontend container
    ├── Image: ECR
    ├── Port: 80
    ├── Depends on backend
    └── CloudWatch logs
```

---

### 📁 `/scripts` - Scripts Utilitaires

**`deploy-aws.sh` (200+ lignes)** :
```bash
Déploiement automatique:
├── Créer VPC + subnets
├── Créer RDS PostgreSQL
├── Créer ECR repositories
├── Créer ECS cluster
├── Créer Load Balancer
├── Créer CloudWatch logs
├── Créer Secrets Manager
├── Créer CloudWatch alarms
├── Créer S3 bucket
└── Créer Dashboard
```

---

### 📁 `/docs` - Documentation

**`ARCHITECTURE.md` (1000+ lignes)** :
- Architecture globale
- Schémas base de données
- Services backend détaillés
- Pipeline CI/CD
- Performance & sécurité
- Disaster recovery

**`API.md` (800+ lignes)** :
- Documentation complète API
- 15+ endpoints documentés
- Exemples requêtes/réponses
- Codes erreur
- Rate limiting
- Authentication

---

## 🚀 Fichiers de Démarrage Rapide

### `START_HERE.md` ⭐
**C'EST LE PREMIER FICHIER À LIRE !**
- Guide de démarrage en 2 minutes
- Commandes essentielles
- Troubleshooting
- Compte de test

### `quick-start.sh` ⭐
**SCRIPT AUTOMATIQUE COMPLET**
```bash
Fonctionnalités:
├── Vérification prérequis
├── Création .env automatique
├── Génération clé secrète
├── Build images Docker
├── Démarrage services
├── Attente santé services
├── Création compte test
└── Affichage URLs accès
```

### `Makefile` ⭐
**25+ COMMANDES SIMPLIFIÉES**
```bash
Principales commandes:
├── make help           # Liste toutes les commandes
├── make quick-start    # Démarrage complet
├── make dev           # Mode développement
├── make test          # Lancer tests
├── make logs          # Voir logs
├── make health        # Vérifier santé
├── make backup        # Backup DB
├── make clean         # Nettoyer
└── make deploy-aws    # Déployer AWS
```

---

## 📊 Métriques du Projet

### Lignes de Code :
```
Backend Python:     ~2,500 lignes
Frontend React:     ~4,200 lignes
Tests:              ~300 lignes
Infrastructure:     ~800 lignes
CI/CD:              ~400 lignes
Scripts:            ~400 lignes
Documentation:      ~3,000 lignes
──────────────────────────────
TOTAL:              ~11,600 lignes
```

### Fichiers Créés :
```
Backend:            11 fichiers
Frontend:           8 fichiers
Infrastructure:     5 fichiers
CI/CD:              2 fichiers
Documentation:      5 fichiers
Configuration:      8 fichiers
Scripts:            2 fichiers
──────────────────────────────
TOTAL:              41 fichiers
```

### Technologies :
```
Backend:            7 technologies
Frontend:           6 technologies
DevOps:             8 technologies
Cloud:              5 services AWS
──────────────────────────────
TOTAL:              26 technologies
```

---

## 🎯 Points d'Entrée par Use Case

### Je veux démarrer rapidement :
1. Lire `START_HERE.md`
2. Exécuter `./quick-start.sh`
3. Ouvrir http://localhost:3000

### Je veux comprendre l'architecture :
1. Lire `README.md`
2. Lire `docs/ARCHITECTURE.md`
3. Explorer `backend/` et `frontend/`

### Je veux modifier le code :
1. Backend : `backend/main.py` et `backend/services/`
2. Frontend : `frontend/src/App.jsx`
3. Lancer : `docker-compose up --build`

### Je veux déployer en production :
1. Lire `README.md` section "Déploiement"
2. Exécuter `./scripts/deploy-aws.sh`
3. Configurer secrets GitHub
4. Push vers branche `main`

### Je veux lancer les tests :
```bash
make test              # Tous les tests
make test-backend      # Backend uniquement
make test-frontend     # Frontend uniquement
```

### Je veux voir les logs :
```bash
make logs              # Tous les logs
make logs SERVICE=backend   # Backend uniquement
docker-compose logs -f      # Temps réel
```

---

## 🔄 Flux de Développement Typique

```
1. Modification code (backend/ ou frontend/)
2. Build & restart : docker-compose up --build -d
3. Tests : make test
4. Commit : git commit -m "feature: xxx"
5. Push : git push
6. CI/CD automatique (GitHub Actions)
7. Déploiement production (si branch main)
```

---

## 🌟 Fichiers les Plus Importants

**Top 10** (par ordre d'importance) :

1. ⭐⭐⭐ `START_HERE.md` - Guide démarrage
2. ⭐⭐⭐ `docker-compose.yml` - Orchestration
3. ⭐⭐⭐ `backend/main.py` - API principale
4. ⭐⭐⭐ `frontend/src/App.jsx` - UI principale
5. ⭐⭐ `README.md` - Documentation
6. ⭐⭐ `.env.example` - Configuration
7. ⭐⭐ `quick-start.sh` - Script auto
8. ⭐⭐ `Makefile` - Commandes
9. ⭐ `.github/workflows/ci-cd.yml` - CI/CD
10. ⭐ `docs/ARCHITECTURE.md` - Architecture

---

**🌍 Structure complète pour un développement professionnel ! 🌱**
