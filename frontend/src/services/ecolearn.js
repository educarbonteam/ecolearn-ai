import api from './api';
import { API_ENDPOINTS } from '../config/api';

// ========================================
// AUTHENTIFICATION
// ========================================

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
   * Note: FastAPI OAuth2 utilise form-data, pas JSON
   */
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post(API_ENDPOINTS.LOGIN, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
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

// ========================================
// GÉNÉRATION IA
// ========================================

export const aiService = {
  /**
   * Générer un cours complet avec l'IA (OpenAI GPT-4)
   */
  generateCourse: async (courseData) => {
    const response = await api.post(API_ENDPOINTS.GENERATE_COURSE, {
      topic: courseData.topic,
      difficulty: courseData.difficulty || 'intermediate',
      duration: courseData.duration || '10h',
      focus_areas: courseData.focus_areas || [],
    });
    return response.data;
  },
};

// ========================================
// COURS
// ========================================

export const courseService = {
  /**
   * Récupérer la liste des cours
   * @param {Object} params - Filtres optionnels (category, skip, limit)
   */
  getCourses: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.COURSES, { params });
    return response.data;
  },

  /**
   * Récupérer un cours spécifique par ID
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
   * Récupérer la liste de mes cours
   */
  getMyCourses: async () => {
    const response = await api.get(API_ENDPOINTS.MY_COURSES);
    return response.data;
  },

  /**
   * Mettre à jour la progression d'un cours
   * @param {number} enrollmentId - ID de l'inscription
   * @param {number} progress - Progression (0-100)
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

// ========================================
// CARBON & IMPACT ENVIRONNEMENTAL
// ========================================

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
   * Récupérer l'historique des métriques carbone
   */
  getCarbonMetrics: async () => {
    const response = await api.get(API_ENDPOINTS.CARBON_METRICS);
    return response.data;
  },

  /**
   * Planter des arbres via l'API de reforestation
   */
  plantTrees: async (count, location = 'Amazon') => {
    const response = await api.post(API_ENDPOINTS.PLANT_TREES, {
      trees_count: count,
      location: location,
    });
    return response.data;
  },

  /**
   * Récupérer les projets de reforestation disponibles
   */
  getProjects: async () => {
    const response = await api.get(API_ENDPOINTS.REFORESTATION_PROJECTS);
    return response.data;
  },
};

// ========================================
// DASHBOARD & STATISTIQUES
// ========================================

export const dashboardService = {
  /**
   * Récupérer toutes les données du dashboard utilisateur
   */
  getDashboard: async () => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD);
    return response.data;
  },

  /**
   * Récupérer les statistiques globales de la plateforme
   */
  getPlatformStats: async () => {
    const response = await api.get(API_ENDPOINTS.PLATFORM_STATS);
    return response.data;
  },
};

// ========================================
// HEALTH CHECK
// ========================================

export const healthService = {
  /**
   * Vérifier la santé de l'API backend
   */
  check: async () => {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    return response.data;
  },
};

// Export par défaut de tous les services
export default {
  auth: authService,
  ai: aiService,
  courses: courseService,
  carbon: carbonService,
  dashboard: dashboardService,
  health: healthService,
};
