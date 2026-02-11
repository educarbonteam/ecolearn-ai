# 🚀 GUIDE COMPLET - Déploiement AWS ECS Uniquement

## 📋 Pipeline CI/CD Respecté
✅ **Tests automatisés (pytest) → Analyse SonarCloud → Déploiement AWS ECS**

---

## 🎯 MODIFICATIONS REQUISES

Ce guide liste **TOUTES** les modifications à apporter au projet existant pour déployer uniquement sur AWS ECS.

---

## 📦 PHASE 1 : FICHIERS À MODIFIER

### 1. Mettre à jour `.aws/task-definition.json`

**REMPLACER** tout le contenu par :

```json
{
  "family": "ecolearn-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/ecolearn-backend:latest",
      "essential": true,
      "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:ecolearn/database-url"
        },
        {
          "name": "OPENAI_API_KEY", 
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:ecolearn/openai-key"
        },
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:ecolearn/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ecolearn-backend",
          "awslogs-region": "REGION",
          "awslogs-stream-prefix": "backend"
        }
      }
    },
    {
      "name": "frontend",
      "image": "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/ecolearn-frontend:latest",
      "essential": true,
      "portMappings": [{"containerPort": 80, "protocol": "tcp"}],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ecolearn-frontend",
          "awslogs-region": "REGION",
          "awslogs-stream-prefix": "frontend"
        }
      },
      "dependsOn": [{"containerName": "backend", "condition": "HEALTHY"}]
    }
  ]
}
```

**Remplacer :**
- `ACCOUNT_ID` par votre AWS Account ID
- `REGION` par votre région (ex: eu-west-1)

---

### 2. Créer `.github/workflows/ecs-deploy.yml`

**NOUVEAU FICHIER** - Pipeline optimisé :

```yaml
name: EcoLearn AI - Pipeline ECS

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
  # ===== STAGE 1: TESTS =====
  test:
    name: Tests pytest
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt pytest pytest-cov
      
      - name: Run pytest
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          SECRET_KEY: test-key
        run: |
          cd backend
          pytest tests/ -v --cov=. --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./backend/coverage.xml

  # ===== STAGE 2: SONARCLOUD =====
  sonarcloud:
    name: Analyse SonarCloud
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # ===== STAGE 3: DEPLOY ECS =====
  deploy:
    name: Déploiement AWS ECS
    runs-on: ubuntu-latest
    needs: [test, sonarcloud]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build & Push Backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_BACKEND:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_BACKEND:$IMAGE_TAG
      
      - name: Build & Push Frontend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend
          docker build -t $ECR_REGISTRY/$ECR_FRONTEND:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_FRONTEND:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --force-new-deployment \
            --region $AWS_REGION
```

---

### 3. Modifier `backend/database.py`

**AJOUTER** le support RDS avec SSL :

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ecolearn:ecolearn2024@localhost:5432/ecolearn_db")

# Support SSL pour RDS
connect_args = {}
if "rds.amazonaws.com" in DATABASE_URL:
    connect_args = {"sslmode": "require"}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=40,
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

### 4. Créer `docker-compose.local.yml`

**Pour développement local uniquement** :

```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ecolearn_db
      POSTGRES_USER: ecolearn
      POSTGRES_PASSWORD: ecolearn2024
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://ecolearn:ecolearn2024@db:5432/ecolearn_db
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Utilisation :**
```bash
docker-compose -f docker-compose.local.yml up -d
```

---

## 🔧 PHASE 2 : CRÉER L'INFRASTRUCTURE AWS

### Script d'installation automatique

**Créer `scripts/setup-aws-ecs.sh` :**

```bash
#!/bin/bash
set -e

AWS_REGION="eu-west-1"
PROJECT="ecolearn"

echo "🚀 Configuration AWS ECS pour $PROJECT"

# 1. Créer VPC
echo "📡 Création VPC..."
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
echo "✅ VPC: $VPC_ID"

# 2. Créer Subnets
SUBNET1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone ${AWS_REGION}a --query 'Subnet.SubnetId' --output text)
SUBNET2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone ${AWS_REGION}b --query 'Subnet.SubnetId' --output text)
aws ec2 modify-subnet-attribute --subnet-id $SUBNET1 --map-public-ip-on-launch
aws ec2 modify-subnet-attribute --subnet-id $SUBNET2 --map-public-ip-on-launch
echo "✅ Subnets: $SUBNET1, $SUBNET2"

# 3. Internet Gateway
IGW=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW
RT=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
aws ec2 associate-route-table --subnet-id $SUBNET1 --route-table-id $RT
aws ec2 associate-route-table --subnet-id $SUBNET2 --route-table-id $RT
echo "✅ Internet Gateway configuré"

# 4. Security Groups
ALB_SG=$(aws ec2 create-security-group --group-name ${PROJECT}-alb-sg --description "ALB SG" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0

ECS_SG=$(aws ec2 create-security-group --group-name ${PROJECT}-ecs-sg --description "ECS SG" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 8000 --source-group $ALB_SG
aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 80 --source-group $ALB_SG

RDS_SG=$(aws ec2 create-security-group --group-name ${PROJECT}-rds-sg --description "RDS SG" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 5432 --source-group $ECS_SG
echo "✅ Security Groups créés"

# 5. RDS PostgreSQL
aws rds create-db-subnet-group --db-subnet-group-name ${PROJECT}-db-subnet --db-subnet-group-description "RDS Subnet" --subnet-ids $SUBNET1 $SUBNET2
aws rds create-db-instance \
  --db-instance-identifier ${PROJECT}-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username ecolearn \
  --master-user-password "$(openssl rand -base64 20)" \
  --allocated-storage 20 \
  --vpc-security-group-ids $RDS_SG \
  --db-subnet-group-name ${PROJECT}-db-subnet \
  --backup-retention-period 7 \
  --no-publicly-accessible

echo "⏳ Attente RDS (5-10 min)..."
aws rds wait db-instance-available --db-instance-identifier ${PROJECT}-db
RDS_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier ${PROJECT}-db --query 'DBInstances[0].Endpoint.Address' --output text)
echo "✅ RDS: $RDS_ENDPOINT"

# 6. Application Load Balancer
ALB_ARN=$(aws elbv2 create-load-balancer --name ${PROJECT}-alb --subnets $SUBNET1 $SUBNET2 --security-groups $ALB_SG --query 'LoadBalancers[0].LoadBalancerArn' --output text)
ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text)

TG_BACKEND=$(aws elbv2 create-target-group --name ${PROJECT}-backend-tg --protocol HTTP --port 8000 --vpc-id $VPC_ID --target-type ip --health-check-path /health --query 'TargetGroups[0].TargetGroupArn' --output text)
TG_FRONTEND=$(aws elbv2 create-target-group --name ${PROJECT}-frontend-tg --protocol HTTP --port 80 --vpc-id $VPC_ID --target-type ip --query 'TargetGroups[0].TargetGroupArn' --output text)

LISTENER=$(aws elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=$TG_FRONTEND --query 'Listeners[0].ListenerArn' --output text)
aws elbv2 create-rule --listener-arn $LISTENER --priority 1 --conditions Field=path-pattern,Values='/api/*' --actions Type=forward,TargetGroupArn=$TG_BACKEND
echo "✅ ALB: $ALB_DNS"

# 7. ECR Repositories
aws ecr create-repository --repository-name ${PROJECT}-backend --image-scanning-configuration scanOnPush=true
aws ecr create-repository --repository-name ${PROJECT}-frontend --image-scanning-configuration scanOnPush=true
echo "✅ ECR Repositories créés"

# 8. ECS Cluster
aws ecs create-cluster --cluster-name ${PROJECT}-cluster
echo "✅ ECS Cluster créé"

# 9. CloudWatch Logs
aws logs create-log-group --log-group-name /ecs/${PROJECT}-backend
aws logs create-log-group --log-group-name /ecs/${PROJECT}-frontend
aws logs put-retention-policy --log-group-name /ecs/${PROJECT}-backend --retention-in-days 30
aws logs put-retention-policy --log-group-name /ecs/${PROJECT}-frontend --retention-in-days 30
echo "✅ CloudWatch Logs créés"

# 10. Secrets Manager
DB_URL="postgresql://ecolearn:PASSWORD@${RDS_ENDPOINT}:5432/ecolearn_db"
aws secretsmanager create-secret --name ${PROJECT}/database-url --secret-string "$DB_URL"
aws secretsmanager create-secret --name ${PROJECT}/jwt-secret --secret-string "$(openssl rand -base64 32)"
aws secretsmanager create-secret --name ${PROJECT}/openai-key --secret-string "CHANGEME"
echo "✅ Secrets créés"

# 11. Sauvegarder la config
cat > aws-config.env <<EOF
AWS_REGION=$AWS_REGION
VPC_ID=$VPC_ID
SUBNET1=$SUBNET1
SUBNET2=$SUBNET2
ECS_SG=$ECS_SG
RDS_ENDPOINT=$RDS_ENDPOINT
ALB_DNS=$ALB_DNS
TG_BACKEND=$TG_BACKEND
TG_FRONTEND=$TG_FRONTEND
EOF

echo ""
echo "✅ Infrastructure créée!"
echo "🔗 ALB DNS: $ALB_DNS"
echo "🔑 Modifier le secret OpenAI:"
echo "   aws secretsmanager update-secret --secret-id ${PROJECT}/openai-key --secret-string 'VOTRE_CLE'"
```

**Rendre exécutable :**
```bash
chmod +x scripts/setup-aws-ecs.sh
```

---

## 🔐 PHASE 3 : SECRETS GITHUB

**Aller dans :** GitHub > Settings > Secrets and variables > Actions

**Ajouter :**

| Secret | Valeur |
|--------|--------|
| `AWS_ACCESS_KEY_ID` | Votre clé AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | Votre secret AWS IAM |
| `SONAR_TOKEN` | Token SonarCloud |
| `SONAR_ORGANIZATION` | Votre organisation SonarCloud |

---

## 🚀 PHASE 4 : DÉPLOIEMENT

### Étape 1 : Infrastructure

```bash
# 1. Configurer AWS CLI
aws configure

# 2. Créer l'infrastructure
./scripts/setup-aws-ecs.sh

# 3. Noter l'ALB DNS et autres infos
```

### Étape 2 : Secrets

```bash
# Modifier le secret OpenAI
aws secretsmanager update-secret \
  --secret-id ecolearn/openai-key \
  --secret-string 'sk-VOTRE-CLE'
```

### Étape 3 : Task Definition

```bash
# Créer la task definition dans ECS Console
# Ou via CLI :
aws ecs register-task-definition \
  --cli-input-json file://.aws/task-definition.json
```

### Étape 4 : Service ECS

```bash
# Remplacer les valeurs par celles du script
aws ecs create-service \
  --cluster ecolearn-cluster \
  --service-name ecolearn-service \
  --task-definition ecolearn-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[SUBNET1,SUBNET2],securityGroups=[ECS_SG],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=TG_FRONTEND,containerName=frontend,containerPort=80"
```

### Étape 5 : Premier Déploiement

```bash
git add .
git commit -m "feat: AWS ECS deployment"
git push origin main
```

Le pipeline s'exécute :
1. ✅ Tests pytest
2. ✅ Analyse SonarCloud
3. ✅ Build Docker → ECR
4. ✅ Deploy ECS

---

## 📊 WORKFLOW COMPLET

### Développement Local

```bash
# Développer localement
docker-compose -f docker-compose.local.yml up -d

# Tests
cd backend && pytest tests/

# Arrêter
docker-compose -f docker-compose.local.yml down
```

### Déploiement Production

```bash
# 1. Commit
git add .
git commit -m "feat: nouvelle fonctionnalité"

# 2. Push (déclenche le pipeline)
git push origin main

# 3. Vérifier le déploiement
aws ecs describe-services \
  --cluster ecolearn-cluster \
  --services ecolearn-service
```

---

## 📝 RÉSUMÉ DES MODIFICATIONS

### Fichiers Modifiés

- ✅ `.aws/task-definition.json` - Configuration ECS
- ✅ `backend/database.py` - Support RDS/SSL

### Fichiers Créés

- ✅ `.github/workflows/ecs-deploy.yml` - Pipeline CI/CD
- ✅ `docker-compose.local.yml` - Dev local
- ✅ `scripts/setup-aws-ecs.sh` - Infrastructure
- ✅ `backend/.dockerignore` - Optimisation build
- ✅ `frontend/.dockerignore` - Optimisation build

### Configuration Externe

- ✅ GitHub Secrets (AWS + SonarCloud)
- ✅ AWS Infrastructure (VPC, RDS, ECS, ALB, ECR)
- ✅ AWS Secrets Manager

---

## ✅ CHECKLIST FINALE

### Infrastructure AWS

- [ ] Script `setup-aws-ecs.sh` exécuté
- [ ] VPC et Subnets créés
- [ ] RDS PostgreSQL créé
- [ ] ALB configuré
- [ ] ECR repositories créés
- [ ] ECS Cluster créé
- [ ] Secrets dans Secrets Manager

### GitHub

- [ ] Secrets AWS configurés
- [ ] Token SonarCloud configuré
- [ ] Repository SonarCloud configuré
- [ ] Pipeline `.github/workflows/ecs-deploy.yml` créé

### Code

- [ ] `database.py` modifié pour RDS
- [ ] `task-definition.json` mis à jour
- [ ] `docker-compose.local.yml` créé

### Déploiement

- [ ] Task definition enregistrée dans ECS
- [ ] Service ECS créé
- [ ] Premier push déclenché
- [ ] Application accessible via ALB DNS

---

## 🎉 VOTRE PROJET EST PRÊT !

**Pipeline CI/CD complet :**
```
Push GitHub → Tests pytest → Analyse SonarCloud → Deploy AWS ECS
```

**Accès application :**
```
http://VOTRE-ALB-DNS.eu-west-1.elb.amazonaws.com
```

---

**Questions ? Consultez les logs :**
```bash
# Logs ECS
aws logs tail /ecs/ecolearn-backend --follow

# Status service
aws ecs describe-services --cluster ecolearn-cluster --services ecolearn-service
```
