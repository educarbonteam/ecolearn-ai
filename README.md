# 🌱 EcoLearn AI - Plateforme d'Apprentissage Éco-Responsable

[![CI/CD Pipeline](https://github.com/your-org/ecolearn-ai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/ecolearn-ai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat\&logo=docker\&logoColor=white)](https://www.docker.com/)

Plateforme d'apprentissage propulsée par l’IA avec suivi d’impact environnemental et intégration reforestation.

---

## 📋 Table des Matières

* [Vue d'Ensemble](#-vue-densemble)
* [Architecture](#-architecture)
* [Technologies](#-technologies)
* [Prérequis](#-prérequis)
* [Installation Locale (DEV)](#-installation-locale-dev)
* [Exécution Production (PROD)](#-exécution-production-prod)
* [Variables d’Environnement & Secrets](#-variables-denvironnement--secrets)
* [API Documentation](#-api-documentation)
* [Tests](#-tests)
* [CI/CD Pipeline](#-cicd-pipeline)

---

## 🎯 Vue d'Ensemble

EcoLearn AI combine :

* **🤖 IA Générative** : génération de cours adaptés (OpenAI/OpenRouter)
* **🌍 Impact Environnemental** : estimation d’empreinte carbone par session
* **🌳 Reforestation** : déclenchement de plantation via API externe (ex: Tree-Nation)
* **📊 Analytics** : dashboard utilisateur + métriques
* **🔒 Sécurité** : authentification JWT + gestion de secrets

### Fonctionnalités

✅ Génération de cours personnalisés
✅ Suivi de progression
✅ Calcul carbone (backend)
✅ Plantation d’arbres via API externe
✅ Dashboard utilisateur (frontend)

> Note : les features “achievements/gamification” peuvent exister dans la roadmap, mais si ce n’est pas implémenté, évite de le vendre comme “fait”.

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────┐
│ Frontend (React + Vite)                   │
│ - UI responsive                           │
│ - Dashboard + charts                       │
└───────────────────┬───────────────────────┘
                    │ HTTP
                    ▼
┌───────────────────────────────────────────┐
│ Backend (FastAPI)                         │
│ - Auth (JWT)                              │
│ - Learning (LLM)                          │
│ - Carbon + Tree API                        │
└───────────────────┬───────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│ PostgreSQL                                 │
│ - Users, Courses, Sessions                 │
│ - Carbon metrics, Plantations              │
└───────────────────────────────────────────┘
```

### Conteneurs Docker (actuels)

**DEV**

* `ecolearn_db` : PostgreSQL (5432)
* `ecolearn_backend` : FastAPI (8000) avec reload
* `ecolearn_frontend` : Vite dev server (3000)

**PROD**

* `ecolearn_db` : PostgreSQL
* `ecolearn_backend` : FastAPI (8000)
* `ecolearn_frontend` : build statique servi par Nginx (3000 → 80)

> Prometheus/Grafana : **à ajouter seulement** si tu as réellement les services + config.

---

## 🛠️ Technologies

### Backend

* FastAPI
* SQLAlchemy + PostgreSQL
* Pydantic
* JWT (python-jose)
* Pytest

### Frontend

* React
* Vite
* Charts (ex: Recharts)
* Axios

### Infrastructure

* Docker / Docker Compose
* PostgreSQL
* Nginx (prod)

### DevOps

* GitHub Actions (CI/CD)
* (Optionnel) AWS ECS/ECR/CloudWatch si le déploiement est réellement câblé

---

## 📦 Prérequis

### Local

* Docker + Docker Compose (plugin `docker compose`)
* Git
* Une clé API OpenAI/OpenRouter (si tu veux activer la génération IA)

---

## 🚀 Installation Locale (DEV)

### 1) Cloner le repo

```bash
git clone https://github.com/your-org/ecolearn-ai.git
cd ecolearn-ai
```

### 2) Créer les fichiers de config

#### A. Variables `.env`

```bash
cp .env.example .env
```

Exemple :

```env
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4o-mini
SECRET_KEY=dev-secret-key
TREE_API_URL=https://api.tree-nation.com/v1
TREE_API_KEY=
```

#### B. Secret API (fichier)

Créer :

```bash
mkdir -p secrets
echo "sk-XXXX" > secrets/openai_api_key.txt
```

### 3) Lancer en DEV

```bash
docker compose -f docker-compose.dev.yml up --build
```

### 4) Accès

* Frontend (DEV) : [http://localhost:3000](http://localhost:3000)
* Backend API : [http://localhost:8000](http://localhost:8000)
* Swagger : [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌐 Exécution Production (PROD)

### 1) Définir les variables prod

Dans `.env` (ou variables d’environnement) :

* `SECRET_KEY` **obligatoire et forte**
* `VITE_API_URL` (URL backend utilisée au build du frontend)

Exemple :

```env
SECRET_KEY=change-me-very-strong
VITE_API_URL=http://localhost:8000
ENVIRONMENT=production
```

### 2) Lancer en PROD

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### 3) Accès

* Frontend (Nginx) : [http://localhost:3000](http://localhost:3000)
* Backend API : [http://localhost:8000](http://localhost:8000)
* Swagger : [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔐 Variables d’Environnement & Secrets

### Backend (principales)

* `DATABASE_URL` : connexion PostgreSQL (interna docker: `db:5432`)
* `OPENAI_BASE_URL`, `OPENAI_MODEL`
* `OPENAI_API_KEY_FILE=/run/secrets/openai_api_key`
* `SECRET_KEY` : **obligatoire en prod**
* `ENVIRONMENT=development|production`

### Frontend

* `VITE_API_URL` : URL backend (utilisée par Vite)

---

## 📚 API Documentation

Swagger UI :

* [http://localhost:8000/docs](http://localhost:8000/docs)

Exemples (à adapter à tes routes réelles) :

### Auth - Register

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ecolearn.ai",
    "name": "Test User",
    "password": "testpassword123"
  }'
```

### AI - Generate Course

```bash
curl -X POST "http://localhost:8000/api/ai/generate-course" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Apprentissage éco-responsable",
    "difficulty": "intermediate",
    "duration_hours": 6
  }'
```

---

## 🧪 Tests

### Backend

```bash
docker compose -f docker-compose.dev.yml exec backend pytest -v
```

### Frontend

```bash
docker compose -f docker-compose.dev.yml exec frontend npm test
```

---

## 🔄 CI/CD Pipeline

Pipeline typique :

1. **BUILD**

   * build backend + frontend
2. **TEST**

   * pytest + tests frontend
3. **ANALYZE**

   * lint / sécurité / qualité
4. **DEPLOY (optionnel)**

   * push images + déploiement (ECS, etc.)

> Important : si AWS/Sonar/Codecov ne sont pas configurés, enlève-les du README ou marque-les “optionnels / à configurer”.

---

## 📄 Licence

MIT License - voir `LICENSE`

---

**🌍 Ensemble, apprenons pour un avenir plus vert ! 🌱**

---
