# 🚀 DÉMARRER ICI - EcoLearn AI

## Bienvenue dans EcoLearn AI !

Ce guide vous permettra de démarrer le projet en quelques minutes.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- ✅ **Docker** (version 24.0+)
- ✅ **Docker Compose** (version 2.0+)
- ✅ **Git**

**Vérification rapide** :
```bash
docker --version
docker-compose --version
```

---

## ⚡ Démarrage Ultra-Rapide (2 minutes)

### Option 1 : Script Automatique (Recommandé) 👍

```bash
# 1. Se placer dans le dossier du projet
cd ecolearn-ai-platform

# 2. Lancer le script de démarrage automatique
./quick-start.sh
```

Le script va automatiquement :
- ✅ Vérifier les prérequis
- ✅ Créer le fichier `.env` avec une clé secrète
- ✅ Construire les images Docker
- ✅ Démarrer tous les services
- ✅ Créer un compte de test
- ✅ Afficher les URLs d'accès

---

### Option 2 : Makefile (Simple)

```bash
cd ecolearn-ai-platform
make quick-start
```

---

### Option 3 : Manuel (Complet)

```bash
# 1. Copier le fichier de configuration
cp .env.example .env

# 2. Éditer .env et ajouter votre clé OpenAI
nano .env  # ou vim, code, etc.
# Ajouter : OPENAI_API_KEY=sk-votre-clé-ici

# 3. Démarrer les services
docker-compose up --build -d

# 4. Attendre que tout soit prêt (environ 30 secondes)
docker-compose logs -f
```

---

## 🌐 Accès aux Services

Une fois démarré, ouvrez votre navigateur :

| Service | URL | Description |
|---------|-----|-------------|
| **🎨 Frontend** | http://localhost:3000 | Application React |
| **🚀 API Backend** | http://localhost:8000 | API FastAPI |
| **📚 API Docs** | http://localhost:8000/docs | Documentation Swagger |
| **📊 Prometheus** | http://localhost:9090 | Métriques |
| **📈 Grafana** | http://localhost:3001 | Dashboards (admin/admin) |

---

## 🔑 Compte de Test

Le script automatique crée un compte de test :

```
📧 Email    : demo@ecolearn.ai
🔒 Password : demo123
```

**Ou créez votre propre compte** sur http://localhost:3000

---

## ⚙️ Configuration Requise

### Variables d'Environnement Essentielles

Dans le fichier `.env`, vous devez configurer :

#### 🔴 **OBLIGATOIRE** :
```env
OPENAI_API_KEY=sk-votre-clé-openai-ici
```
👉 Obtenez votre clé sur : https://platform.openai.com/api-keys

#### 🟢 **OPTIONNEL** (pour fonctionnalités avancées) :
```env
TREE_API_KEY=votre-clé-tree-nation
AWS_ACCESS_KEY_ID=votre-clé-aws
AWS_SECRET_ACCESS_KEY=votre-secret-aws
```

---

## 🛠️ Commandes Utiles

```bash
# Voir les logs en temps réel
make logs

# Vérifier la santé des services
make health

# Arrêter tous les services
make stop

# Redémarrer
make restart

# Nettoyer complètement
make clean

# Voir toutes les commandes disponibles
make help
```

---

## 📊 Vérification du Bon Fonctionnement

### 1. Vérifier que tous les conteneurs sont en cours d'exécution :
```bash
docker-compose ps
```

Vous devriez voir 3 conteneurs `Up` :
- ✅ `ecolearn_frontend`
- ✅ `ecolearn_backend`
- ✅ `ecolearn`

### 2. Test de l'API :
```bash
curl http://localhost:8000/health
```

Réponse attendue : `{"status":"healthy","service":"ecolearn-api","timestamp":"..."}`

### 3. Test du Frontend :
Ouvrez http://localhost:3000 dans votre navigateur

---

## 🎯 Tester les Fonctionnalités

### 1. Créer un compte
1. Allez sur http://localhost:3000
2. Cliquez sur "Créer un compte"
3. Remplissez le formulaire
4. Connectez-vous

### 2. Générer un cours avec l'IA
1. Connectez-vous
2. Cliquez sur "Générer un Cours"
3. Choisissez un sujet (ex: "Machine Learning pour l'Écologie")
4. Sélectionnez le niveau et la durée
5. Cliquez sur "Générer avec IA"
6. Attendez quelques secondes ⏳
7. Votre cours personnalisé est prêt ! 🎉

### 3. Suivre votre impact environnemental
1. Allez dans "Impact"
2. Consultez vos métriques CO₂
3. Voyez combien d'arbres ont été plantés
4. Suivez l'évolution sur les graphiques

---

## 🚨 Résolution de Problèmes

### Problème : "Port 3000 already in use"
```bash
# Trouver le processus qui utilise le port
lsof -i :3000
# Tuer le processus
kill -9 <PID>
```

### Problème : "Cannot connect to the Docker daemon"
```bash
# Démarrer Docker Desktop
# Ou sur Linux :
sudo systemctl start docker
```

### Problème : "Error: OPENAI_API_KEY not set"
1. Vérifiez que `.env` existe : `ls -la .env`
2. Vérifiez que la clé est présente : `grep OPENAI_API_KEY .env`
3. Redémarrez les conteneurs : `docker-compose restart backend`

### Problème : "Database connection error"
```bash
# Vérifier les logs de la base de données
docker-compose logs db

# Réinitialiser la base de données
docker-compose down -v
docker-compose up -d
```

---

## 📚 Prochaines Étapes

### Pour les Développeurs :

1. **Lire la documentation complète** : `docs/ARCHITECTURE.md`
2. **Comprendre l'API** : `docs/API.md` ou http://localhost:8000/docs
3. **Modifier le code** :
   - Backend : `backend/`
   - Frontend : `frontend/src/`
4. **Lancer les tests** : `make test`

### Pour le Déploiement en Production :

1. **Configurer les secrets GitHub** (pour CI/CD)
2. **Exécuter le script AWS** : `./scripts/deploy-aws.sh`
3. **Consulter** : `README.md` section "Déploiement Production"

---

## 🆘 Besoin d'Aide ?

- **Documentation complète** : `README.md`
- **Architecture technique** : `docs/ARCHITECTURE.md`
- **Documentation API** : `docs/API.md`
- **Makefile commands** : `make help`

---

## ✅ Checklist de Démarrage

- [ ] Docker et Docker Compose installés
- [ ] Projet cloné/téléchargé
- [ ] Fichier `.env` créé avec OPENAI_API_KEY
- [ ] Services démarrés : `./quick-start.sh` ou `make quick-start`
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Backend accessible sur http://localhost:8000
- [ ] Compte créé et connexion réussie
- [ ] Premier cours généré avec l'IA 🎉

---

**🌍 Prêt à apprendre pour un avenir plus vert ! 🌱**

*Si vous rencontrez des problèmes, consultez `README.md` ou les fichiers de documentation dans `/docs`*
