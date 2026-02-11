# 🔗 Guide Complet - Communication Frontend ↔ Backend

## 🎯 Objectif
Faire communiquer le **frontend React** avec le **backend FastAPI** pour envoyer et recevoir des données.

---

## 📐 Architecture de Communication

### Développement Local
```
Frontend (React)          Backend (FastAPI)
localhost:3000     →      localhost:8000
    ↓                          ↓
Appels API              Endpoints REST
(axios/fetch)          (main.py)
```

### Production AWS ECS
```
Frontend              ALB                Backend
(Nginx:80)     →    (Port 80)    →    (FastAPI:8000)
    ↓                  ↓                    ↓
/                   Route /           Endpoints
/api/*              Route /api/*      /api/*
```

---

## 🔧 CONFIGURATION REQUISE

### 1️⃣ Configuration Backend (FastAPI)

#### A. Vérifier CORS dans `backend/main.py`

**S'assurer que ces lignes sont présentes :**

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EcoLearn AI API",
    description="API for AI-powered learning",
    version="1.0.0"
)

# Configuration CORS - TRÈS IMPORTANT !
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",           # Dev local
        "http://localhost",                # Production locale
        "*"                                 # Production (ou spécifier l'URL ALB)
    ],
    allow_credentials=True,
    allow_methods=["*"],                   # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],                   # Authorization, Content-Type, etc.
)
```

**Pour production, remplacer `"*"` par l'URL de votre ALB :**
```python
allow_origins=[
    "http://localhost:3000",
    "http://ecolearn-alb-123456789.eu-west-1.elb.amazonaws.com",
],
```

---

### 2️⃣ Configuration Frontend (React)

#### A. Créer un fichier de configuration API

**CRÉER** `frontend/src/config/api.js` :

```javascript
// Configuration de l'API selon l'environnement

const API_CONFIG = {
  // Développement local
  development: {
    baseURL: 'http://localhost:8000',
  },
  // Production (AWS ECS)
  production: {
    baseURL: window.location.origin,  // Utilise la même origine (ALB)
  }
};

// Détection automatique de l'environnement
const ENV = process.env.NODE_ENV || 'development';

export const API_BASE_URL = API_CONFIG[ENV].baseURL;
export const API_ENDPOINTS = {
  // Authentification
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/token',
  ME: '/api/auth/me',
  
  // Génération IA
  GENERATE_COURSE: '/api/ai/generate-course',
  
  // Cours
  COURSES: '/api/courses',
  COURSE_DETAIL: (id) => `/api/courses/${id}`,
  ENROLL: (id) => `/api/courses/${id}/enroll`,
  MY_COURSES: '/api/my-courses',
  UPDATE_PROGRESS: (id) => `/api/enrollments/${id}/progress`,
  
  // Carbon & Impact
  CALCULATE_CARBON: '/api/carbon/calculate',
  CARBON_METRICS: '/api/carbon/metrics',
  PLANT_TREES: '/api/trees/plant',
  REFORESTATION_PROJECTS: '/api/trees/projects',
  
  // Dashboard
  DASHBOARD: '/api/dashboard',
  PLATFORM_STATS: '/api/stats/platform',
  
  // Health
  HEALTH: '/health',
};

console.log(`🔌 API Configuration: ${ENV} mode`);
console.log(`🌐 Base URL: ${API_BASE_URL}`);
```

---

#### B. Créer un service API avec Axios

**CRÉER** `frontend/src/services/api.js` :

```javascript
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Créer une instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Rediriger vers login si 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

#### C. Créer les fonctions d'appel API

**CRÉER** `frontend/src/services/ecolearn.js` :

```javascript
import api from './api';
import { API_ENDPOINTS } from '../config/api';

// ========== AUTHENTIFICATION ==========

export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, {
      email: userData.email,
      name: userData.name,
      password: userData.password,
    });
    return response.data;
  },

  /**
   * Connexion utilisateur
   */
  login: async (email, password) => {
    // FastAPI OAuth2 attend un form-data, pas du JSON
    const formData = new URLSearchParams();
    formData.append('username', email);  // OAuth2 utilise 'username'
    formData.append('password', password);

    const response = await api.post(API_ENDPOINTS.LOGIN, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Sauvegarder le token
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },

  /**
   * Récupérer infos utilisateur connecté
   */
  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.ME);
    return response.data;
  },

  /**
   * Déconnexion
   */
  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  },
};

// ========== GÉNÉRATION IA ==========

export const aiService = {
  /**
   * Générer un cours avec l'IA
   */
  generateCourse: async (courseData) => {
    const response = await api.post(API_ENDPOINTS.GENERATE_COURSE, {
      topic: courseData.topic,
      difficulty: courseData.difficulty,
      duration: courseData.duration,
      focus_areas: courseData.focus_areas || [],
    });
    return response.data;
  },
};

// ========== COURS ==========

export const courseService = {
  /**
   * Récupérer la liste des cours
   */
  getCourses: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.COURSES, { params });
    return response.data;
  },

  /**
   * Récupérer un cours par ID
   */
  getCourseById: async (id) => {
    const response = await api.get(API_ENDPOINTS.COURSE_DETAIL(id));
    return response.data;
  },

  /**
   * S'inscrire à un cours
   */
  enrollCourse: async (courseId) => {
    const response = await api.post(API_ENDPOINTS.ENROLL(courseId));
    return response.data;
  },

  /**
   * Récupérer mes cours
   */
  getMyCourses: async () => {
    const response = await api.get(API_ENDPOINTS.MY_COURSES);
    return response.data;
  },

  /**
   * Mettre à jour la progression
   */
  updateProgress: async (enrollmentId, progress) => {
    const response = await api.patch(
      API_ENDPOINTS.UPDATE_PROGRESS(enrollmentId),
      null,
      { params: { progress } }
    );
    return response.data;
  },
};

// ========== CARBON & IMPACT ==========

export const carbonService = {
  /**
   * Calculer l'empreinte carbone
   */
  calculateCarbon: async (hours, category) => {
    const response = await api.post(API_ENDPOINTS.CALCULATE_CARBON, {
      learning_hours: hours,
      course_category: category,
    });
    return response.data;
  },

  /**
   * Récupérer les métriques carbone
   */
  getCarbonMetrics: async () => {
    const response = await api.get(API_ENDPOINTS.CARBON_METRICS);
    return response.data;
  },

  /**
   * Planter des arbres
   */
  plantTrees: async (count, location) => {
    const response = await api.post(API_ENDPOINTS.PLANT_TREES, {
      trees_count: count,
      location: location,
    });
    return response.data;
  },

  /**
   * Récupérer les projets de reforestation
   */
  getProjects: async () => {
    const response = await api.get(API_ENDPOINTS.REFORESTATION_PROJECTS);
    return response.data;
  },
};

// ========== DASHBOARD ==========

export const dashboardService = {
  /**
   * Récupérer les données du dashboard
   */
  getDashboard: async () => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD);
    return response.data;
  },

  /**
   * Récupérer les stats de la plateforme
   */
  getPlatformStats: async () => {
    const response = await api.get(API_ENDPOINTS.PLATFORM_STATS);
    return response.data;
  },
};

// ========== HEALTH CHECK ==========

export const healthService = {
  /**
   * Vérifier la santé de l'API
   */
  check: async () => {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    return response.data;
  },
};
```

---

## 💡 EXEMPLES D'UTILISATION DANS LES COMPOSANTS

### Exemple 1 : Inscription Utilisateur

**Modifier dans `frontend/src/App.jsx`** (dans le composant `AuthModal`) :

```javascript
import { authService } from './services/ecolearn';

const AuthModal = ({ mode, onClose, onSuccess, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // Inscription
        await authService.register(formData);
        alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        onSwitchMode(); // Passer en mode login
      } else {
        // Connexion
        await authService.login(formData.email, formData.password);
        
        // Récupérer les infos utilisateur
        const user = await authService.getCurrentUser();
        console.log('✅ Utilisateur connecté:', user);
        
        onSuccess(user);
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(
        err.response?.data?.detail || 
        'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Nom complet"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        
        <input
          type="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Chargement...' : mode === 'signup' ? 'Créer un compte' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};
```

---

### Exemple 2 : Génération de Cours avec IA

**Ajouter dans `frontend/src/App.jsx`** (dans `GenerateCourseView`) :

```javascript
import { aiService } from './services/ecolearn';

const GenerateCourseView = () => {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'intermediate',
    duration: '10h',
    focus_areas: []
  });

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      console.log('🤖 Génération du cours...', formData);
      
      const result = await aiService.generateCourse(formData);
      
      console.log('✅ Cours généré:', result);
      setGeneratedCourse(result);
      setStep(4); // Aller à l'étape de résultat
      
    } catch (error) {
      console.error('❌ Erreur génération:', error);
      alert(
        error.response?.data?.detail || 
        'Erreur lors de la génération. Vérifiez votre clé OpenAI.'
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="generate-course-view">
      {/* Formulaire de génération */}
      {step === 3 && (
        <button onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <>
              <Loader size={20} className="spinner" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Générer avec IA
            </>
          )}
        </button>
      )}

      {/* Affichage du cours généré */}
      {generatedCourse && (
        <div className="generated-course">
          <h2>{generatedCourse.course.title}</h2>
          <p>{generatedCourse.course.description}</p>
          
          <div className="modules-list">
            {generatedCourse.content.modules.map((module, index) => (
              <div key={index} className="module-item">
                <h3>{module.title}</h3>
                <p>{module.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### Exemple 3 : Récupérer et Afficher les Cours

**Ajouter dans `CoursesView` :**

```javascript
import { useEffect, useState } from 'react';
import { courseService } from './services/ecolearn';

const CoursesView = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseService.getCourses();
      console.log('📚 Cours récupérés:', data);
      setCourses(data);
    } catch (error) {
      console.error('❌ Erreur chargement cours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollCourse(courseId);
      alert('✅ Inscription réussie !');
      loadCourses(); // Recharger la liste
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'inscription');
    }
  };

  if (loading) {
    return <div>Chargement des cours...</div>;
  }

  return (
    <div className="courses-view">
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p>Durée: {course.duration}</p>
            <p>Difficulté: {course.difficulty}</p>
            
            <button onClick={() => handleEnroll(course.id)}>
              S'inscrire
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### Exemple 4 : Dashboard avec Stats

**Ajouter dans `DashboardView` :**

```javascript
import { useEffect, useState } from 'react';
import { dashboardService } from './services/ecolearn';

const DashboardView = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getDashboard();
      console.log('📊 Dashboard data:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('❌ Erreur dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="dashboard-view">
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Heures d'apprentissage</h3>
          <div className="metric-value">
            {dashboardData.learning_stats.total_hours}h
          </div>
        </div>

        <div className="metric-card">
          <h3>Cours complétés</h3>
          <div className="metric-value">
            {dashboardData.learning_stats.courses_completed}
          </div>
        </div>

        <div className="metric-card">
          <h3>CO₂ compensé</h3>
          <div className="metric-value">
            {dashboardData.user.carbon_offset} kg
          </div>
        </div>

        <div className="metric-card">
          <h3>Arbres plantés</h3>
          <div className="metric-value">
            {dashboardData.user.trees_planted}
          </div>
        </div>
      </div>

      {/* Cours récents */}
      <div className="recent-courses">
        <h2>Mes cours récents</h2>
        {dashboardData.recent_courses.map((enrollment) => (
          <div key={enrollment.id} className="course-item">
            <h3>{enrollment.course.title}</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
            <span>{enrollment.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔧 CONFIGURATION PRODUCTION (AWS ECS)

### 1. Configuration Nginx pour Frontend

**CRÉER/MODIFIER** `frontend/nginx.conf` :

```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;

    # Servir les fichiers statiques
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy pour les appels API vers le backend
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
    }

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

### 2. Variables d'Environnement Frontend

**MODIFIER** `frontend/Dockerfile` :

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variable d'environnement pour production
ENV NODE_ENV=production
ENV REACT_APP_API_URL=/

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📋 CHECKLIST DE VÉRIFICATION

### Backend ✅

- [ ] CORS configuré dans `main.py`
- [ ] Tous les endpoints commencent par `/api/`
- [ ] Health check `/health` accessible
- [ ] JWT authentication fonctionnel
- [ ] Variables d'environnement configurées (DATABASE_URL, OPENAI_API_KEY)

### Frontend ✅

- [ ] Fichier `config/api.js` créé
- [ ] Service `services/api.js` créé avec axios
- [ ] Service `services/ecolearn.js` créé avec toutes les fonctions
- [ ] Imports ajoutés dans les composants
- [ ] Token JWT sauvegardé dans localStorage
- [ ] Intercepteurs axios configurés

### Dev Local ✅

- [ ] Backend sur `localhost:8000`
- [ ] Frontend sur `localhost:3000`
- [ ] CORS autorise `localhost:3000`
- [ ] Tests de connexion fonctionnels

### Production AWS ECS ✅

- [ ] `nginx.conf` configure le proxy `/api/` → `:8000`
- [ ] Task definition lie frontend et backend
- [ ] ALB route correctement `/api/*` et `/*`
- [ ] Variables d'environnement production configurées

---

## 🧪 TESTS DE COMMUNICATION

### Test 1 : Health Check

```bash
# Dev local
curl http://localhost:8000/health

# Production
curl http://VOTRE-ALB-DNS.amazonaws.com/health
```

**Réponse attendue :**
```json
{
  "status": "healthy",
  "service": "ecolearn-api",
  "timestamp": "2024-02-11T..."
}
```

---

### Test 2 : Inscription depuis le Frontend

1. Ouvrir le frontend
2. Cliquer sur "Créer un compte"
3. Remplir le formulaire
4. Vérifier dans la console :
```
📤 API Request: POST /api/auth/register
✅ API Response: /api/auth/register 200
```

---

### Test 3 : Génération de Cours IA

1. Se connecter
2. Aller sur "Générer un Cours"
3. Remplir le formulaire
4. Cliquer sur "Générer avec IA"
5. Vérifier dans la console :
```
📤 API Request: POST /api/ai/generate-course
🤖 Génération du cours...
✅ Cours généré: {...}
```

---

## 🐛 TROUBLESHOOTING

### Erreur : CORS

**Symptôme :**
```
Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution :**
Vérifier `backend/main.py` → `allow_origins` contient `http://localhost:3000`

---

### Erreur : 401 Unauthorized

**Symptôme :**
```
❌ API Error: Unauthorized
```

**Solution :**
1. Vérifier que le token est sauvegardé :
```javascript
console.log(localStorage.getItem('access_token'));
```

2. Vérifier l'intercepteur axios ajoute le header :
```javascript
config.headers.Authorization = `Bearer ${token}`;
```

---

### Erreur : Network Error

**Symptôme :**
```
❌ API Error: Network Error
```

**Solutions :**
1. Vérifier que le backend est démarré : `docker ps`
2. Vérifier l'URL dans `config/api.js`
3. Tester directement : `curl http://localhost:8000/health`

---

### Erreur : Cannot read property 'data'

**Symptôme :**
```
TypeError: Cannot read property 'data' of undefined
```

**Solution :**
Utiliser try-catch et vérifier la réponse :
```javascript
try {
  const response = await api.get('/api/courses');
  console.log('Response:', response);
  return response.data;
} catch (error) {
  console.error('Error details:', error.response?.data);
}
```

---

## 🚀 COMMANDES UTILES

### Démarrer le projet

```bash
# Dev local
docker-compose -f docker-compose.local.yml up -d

# Voir les logs
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend

# Tester le backend
curl http://localhost:8000/health

# Ouvrir le frontend
open http://localhost:3000
```

---

## 📚 RÉSUMÉ

**3 fichiers à créer dans le frontend :**
1. ✅ `frontend/src/config/api.js` - Configuration URLs
2. ✅ `frontend/src/services/api.js` - Client axios
3. ✅ `frontend/src/services/ecolearn.js` - Fonctions API

**Puis utiliser dans vos composants :**
```javascript
import { authService, courseService, aiService } from './services/ecolearn';

// Exemple : Générer un cours
const result = await aiService.generateCourse({
  topic: "Machine Learning",
  difficulty: "intermediate",
  duration: "15h"
});
```

**C'est tout ! Votre frontend communique maintenant avec le backend ! 🎉**
