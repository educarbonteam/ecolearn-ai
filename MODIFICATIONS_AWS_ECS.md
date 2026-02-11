# ✏️ MODIFICATIONS POUR AWS ECS - Guide Action

## 🎯 Pipeline CI/CD Cible
**Tests pytest → Analyse SonarCloud → Déploiement AWS ECS**

---

## 📝 MODIFICATIONS À APPORTER (7 actions)

### ✅ ACTION 1 : Supprimer le monitoring local

**SUPPRIMER** ces services de `docker-compose.yml` :
```yaml
# SUPPRIMER ces lignes :
  prometheus:
    ...
  grafana:
    ...
```

**OU** renommer `docker-compose.yml` en `docker-compose.local.yml` pour garder pour le dev local uniquement.

---

### ✅ ACTION 2 : Modifier le pipeline CI/CD

**REMPLACER** `.github/workflows/ci-cd.yml` par :

```yaml
name: CI/CD Pipeline - AWS ECS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: eu-west-1
  ECR_BACKEND: ecolearn-backend
  ECR_FRONTEND: ecolearn-frontend
  ECS_CLUSTER: ecolearn-cluster
  ECS_SERVICE: ecolearn-service

jobs:
  # ========== STAGE 1: TESTS PYTEST ==========
  test:
    name: 🧪 Tests pytest
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4
      
      - name: 🐍 Setup Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: 📦 Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio
      
      - name: 🧪 Run pytest
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
          SECRET_KEY: test-secret-key
          OPENAI_API_KEY: sk-test
        run: |
          cd backend
          pytest tests/ -v --cov=. --cov-report=xml --cov-report=term
      
      - name: 📊 Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./backend/coverage.xml
          token: ${{ secrets.CODECOV_TOKEN }}
        continue-on-error: true

  # ========== STAGE 2: SONARCLOUD ==========
  sonarcloud:
    name: 📊 Analyse SonarCloud
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: 🔍 SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # ========== STAGE 3: BUILD & DEPLOY ECS ==========
  deploy:
    name: 🚀 Deploy AWS ECS
    runs-on: ubuntu-latest
    needs: [test, sonarcloud]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4
      
      - name: 🔐 Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: 🔑 Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: 🏗️ Build & Push Backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_BACKEND:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_BACKEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_BACKEND:latest
          docker push $ECR_REGISTRY/$ECR_BACKEND:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_BACKEND:latest
      
      - name: 🏗️ Build & Push Frontend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend
          docker build -t $ECR_REGISTRY/$ECR_FRONTEND:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_FRONTEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_FRONTEND:latest
          docker push $ECR_REGISTRY/$ECR_FRONTEND:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_FRONTEND:latest
      
      - name: 🚀 Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment \
            --region $AWS_REGION
          
          echo "✅ Deployment initiated"
      
      - name: ⏳ Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster $ECS_CLUSTER \
            --services $ECS_SERVICE \
            --region $AWS_REGION
          
          echo "✅ Deployment completed successfully"
```

---

### ✅ ACTION 3 : Modifier `backend/database.py`

**AJOUTER** le support SSL pour RDS :

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator

# Support environment variable (AWS Secrets Manager)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://ecolearn:ecolearn2024@db:5432/ecolearn_db"
)

# Configuration pour RDS avec SSL
connect_args = {}
if "rds.amazonaws.com" in DATABASE_URL:
    connect_args = {
        "sslmode": "require",
        "connect_timeout": 10
    }

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=40,
    pool_recycle=3600,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### ✅ ACTION 4 : Mettre à jour `.aws/task-definition.json`

**REMPLACER** le contenu par (en adaptant ACCOUNT_ID et REGION) :

```json
{
  "family": "ecolearn-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::VOTRE_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::VOTRE_ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "VOTRE_ACCOUNT_ID.dkr.ecr.VOTRE_REGION.amazonaws.com/ecolearn-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:VOTRE_REGION:VOTRE_ACCOUNT_ID:secret:ecolearn/database-url"
        },
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:VOTRE_REGION:VOTRE_ACCOUNT_ID:secret:ecolearn/openai-key"
        },
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:VOTRE_REGION:VOTRE_ACCOUNT_ID:secret:ecolearn/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ecolearn-backend",
          "awslogs-region": "VOTRE_REGION",
          "awslogs-stream-prefix": "backend"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    },
    {
      "name": "frontend",
      "image": "VOTRE_ACCOUNT_ID.dkr.ecr.VOTRE_REGION.amazonaws.com/ecolearn-frontend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "REACT_APP_API_URL",
          "value": "http://localhost:8000"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ecolearn-frontend",
          "awslogs-region": "VOTRE_REGION",
          "awslogs-stream-prefix": "frontend"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost/ || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 40
      },
      "dependsOn": [
        {
          "containerName": "backend",
          "condition": "HEALTHY"
        }
      ]
    }
  ]
}
```

**Remplacer :**
- `VOTRE_ACCOUNT_ID` → votre AWS Account ID (ex: 123456789012)
- `VOTRE_REGION` → votre région AWS (ex: eu-west-1)

---

### ✅ ACTION 5 : Créer `.dockerignore` pour optimisation

**CRÉER** `backend/.dockerignore` :
```
__pycache__
*.pyc
*.pyo
.pytest_cache
.coverage
tests/
*.md
.git
```

**CRÉER** `frontend/.dockerignore` :
```
node_modules
.git
*.md
.env.local
```

---

### ✅ ACTION 6 : Renommer docker-compose pour dev local

```bash
# Renommer pour clarifier l'usage
mv docker-compose.yml docker-compose.local.yml
```

**MODIFIER** le `Makefile` pour utiliser le bon fichier :
```makefile
dev: ## Start local development
	docker-compose -f docker-compose.local.yml up -d

stop: ## Stop local development
	docker-compose -f docker-compose.local.yml down
```

---

### ✅ ACTION 7 : Configurer GitHub Secrets

**Aller dans :** GitHub → Settings → Secrets and variables → Actions → New repository secret

**AJOUTER ces 4 secrets :**

| Nom du Secret | Valeur | Comment l'obtenir |
|---------------|--------|-------------------|
| `AWS_ACCESS_KEY_ID` | Votre clé AWS | IAM Console → Users → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Votre secret AWS | IAM Console → Users → Security credentials |
| `SONAR_TOKEN` | Token SonarCloud | https://sonarcloud.io/account/security |
| `SONAR_ORGANIZATION` | Nom organisation | Visible sur SonarCloud dashboard |

---

## 🏗️ INFRASTRUCTURE AWS À CRÉER

### Option 1 : Via Console AWS (Manuel - 30 min)

**À créer dans cet ordre :**

1. **VPC**
   - CIDR: 10.0.0.0/16
   - 2 subnets publics (AZ-a et AZ-b)
   - Internet Gateway attaché

2. **RDS PostgreSQL**
   - Type: db.t3.micro
   - Engine: PostgreSQL 15
   - Multi-AZ: Non (dev) ou Oui (prod)
   - Storage: 20 GB

3. **ECR Repositories**
   - `ecolearn-backend`
   - `ecolearn-frontend`

4. **ECS Cluster**
   - Type: Fargate
   - Nom: `ecolearn-cluster`

5. **Application Load Balancer**
   - Type: Application
   - Scheme: Internet-facing
   - 2 Target Groups (backend:8000, frontend:80)

6. **Secrets Manager**
   - `ecolearn/database-url` → Connection string RDS
   - `ecolearn/openai-key` → Votre clé OpenAI
   - `ecolearn/jwt-secret` → Secret JWT généré

7. **CloudWatch Log Groups**
   - `/ecs/ecolearn-backend`
   - `/ecs/ecolearn-frontend`

8. **IAM Roles**
   - `ecsTaskExecutionRole` (avec AmazonECSTaskExecutionRolePolicy)
   - `ecsTaskRole` (avec accès Secrets Manager)

9. **ECS Task Definition**
   - Utiliser le JSON de `.aws/task-definition.json`
   - Enregistrer dans ECS Console

10. **ECS Service**
    - Cluster: ecolearn-cluster
    - Task definition: ecolearn-task
    - Desired count: 2
    - Load balancer: Attacher les target groups

---

### Option 2 : Via Script Automatique (Recommandé - 10 min)

**CRÉER** `scripts/setup-aws-ecs.sh` :

```bash
#!/bin/bash
set -e

AWS_REGION="${AWS_REGION:-eu-west-1}"
PROJECT="ecolearn"

echo "🚀 Setup AWS ECS Infrastructure"

# VPC
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region $AWS_REGION --query 'Vpc.VpcId' --output text)
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames --region $AWS_REGION
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=${PROJECT}-vpc --region $AWS_REGION

# Subnets
SUBNET1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone ${AWS_REGION}a --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
SUBNET2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone ${AWS_REGION}b --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
aws ec2 modify-subnet-attribute --subnet-id $SUBNET1 --map-public-ip-on-launch --region $AWS_REGION
aws ec2 modify-subnet-attribute --subnet-id $SUBNET2 --map-public-ip-on-launch --region $AWS_REGION

# Internet Gateway
IGW=$(aws ec2 create-internet-gateway --region $AWS_REGION --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW --region $AWS_REGION

# Route Table
RT=$(aws ec2 create-route-table --vpc-id $VPC_ID --region $AWS_REGION --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $SUBNET1 --route-table-id $RT --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $SUBNET2 --route-table-id $RT --region $AWS_REGION

# Security Groups
ALB_SG=$(aws ec2 create-security-group --group-name ${PROJECT}-alb-sg --description "ALB SG" --vpc-id $VPC_ID --region $AWS_REGION --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION

ECS_SG=$(aws ec2 create-security-group --group-name ${PROJECT}-ecs-sg --description "ECS SG" --vpc-id $VPC_ID --region $AWS_REGION --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 8000 --source-group $ALB_SG --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 80 --source-group $ALB_SG --region $AWS_REGION

RDS_SG=$(aws ec2 create-security-group --group-name ${PROJECT}-rds-sg --description "RDS SG" --vpc-id $VPC_ID --region $AWS_REGION --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 5432 --source-group $ECS_SG --region $AWS_REGION

# RDS
aws rds create-db-subnet-group --db-subnet-group-name ${PROJECT}-subnet --db-subnet-group-description "RDS Subnet" --subnet-ids $SUBNET1 $SUBNET2 --region $AWS_REGION
DB_PASSWORD=$(openssl rand -base64 20)
aws rds create-db-instance \
  --db-instance-identifier ${PROJECT}-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username ecolearn \
  --master-user-password "$DB_PASSWORD" \
  --allocated-storage 20 \
  --vpc-security-group-ids $RDS_SG \
  --db-subnet-group-name ${PROJECT}-subnet \
  --backup-retention-period 7 \
  --no-publicly-accessible \
  --region $AWS_REGION

echo "⏳ Waiting for RDS..."
aws rds wait db-instance-available --db-instance-identifier ${PROJECT}-db --region $AWS_REGION
RDS_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier ${PROJECT}-db --region $AWS_REGION --query 'DBInstances[0].Endpoint.Address' --output text)

# ALB
ALB_ARN=$(aws elbv2 create-load-balancer --name ${PROJECT}-alb --subnets $SUBNET1 $