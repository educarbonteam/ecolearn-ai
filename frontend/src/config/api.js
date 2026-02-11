// Configuration de l'API EcoLearn AI
// Ce fichier gère automatiquement l'URL selon l'environnement

const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000',
  },
  production: {
    baseURL: window.location.origin,
  }
};

const ENV = process.env.NODE_ENV || 'development';

export const API_BASE_URL = API_CONFIG[ENV].baseURL;

// Liste complète des endpoints disponibles
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

console.log(`🔌 API Mode: ${ENV}`);
console.log(`🌐 Base URL: ${API_BASE_URL}`);
