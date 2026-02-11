// EXEMPLE D'UTILISATION DES SERVICES API
// Ce fichier montre comment utiliser les services dans vos composants React

import React, { useState, useEffect } from 'react';
import { 
  authService, 
  courseService, 
  aiService, 
  carbonService,
  dashboardService 
} from './services/ecolearn';

// ========================================
// EXEMPLE 1 : AUTHENTIFICATION
// ========================================

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Connexion
      const result = await authService.login(email, password);
      console.log('✅ Token:', result.access_token);
      
      // Récupérer les infos utilisateur
      const user = await authService.getCurrentUser();
      console.log('✅ User:', user);
      
      alert('Connexion réussie !');
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.detail || 'Connexion échouée'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};

// ========================================
// EXEMPLE 2 : INSCRIPTION
// ========================================

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      await authService.register(formData);
      alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.detail || 'Inscription échouée'));
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input 
        type="text"
        placeholder="Nom complet"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
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
      <button type="submit">Créer un compte</button>
    </form>
  );
};

// ========================================
// EXEMPLE 3 : GÉNÉRER UN COURS AVEC L'IA
// ========================================

const CourseGenerator = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState('10h');
  const [generating, setGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);

  const handleGenerate = async () => {
    if (!topic) {
      alert('Veuillez entrer un sujet');
      return;
    }

    setGenerating(true);
    
    try {
      console.log('🤖 Génération du cours...');
      
      const result = await aiService.generateCourse({
        topic,
        difficulty,
        duration,
        focus_areas: ['pratique', 'théorie']
      });
      
      console.log('✅ Cours généré:', result);
      setGeneratedCourse(result);
      
      alert('Cours généré avec succès !');
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.detail || 'Génération échouée'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h2>Générer un cours avec l'IA</h2>
      
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Sujet du cours (ex: Machine Learning)"
      />
      
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="beginner">Débutant</option>
        <option value="intermediate">Intermédiaire</option>
        <option value="advanced">Avancé</option>
      </select>
      
      <select value={duration} onChange={(e) => setDuration(e.target.value)}>
        <option value="5h">5 heures</option>
        <option value="10h">10 heures</option>
        <option value="20h">20 heures</option>
      </select>
      
      <button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Génération en cours...' : 'Générer le cours'}
      </button>

      {generatedCourse && (
        <div>
          <h3>{generatedCourse.course.title}</h3>
          <p>{generatedCourse.course.description}</p>
          <p>Modules: {generatedCourse.course.modules}</p>
          <p>Durée: {generatedCourse.course.duration}</p>
        </div>
      )}
    </div>
  );
};

// ========================================
// EXEMPLE 4 : LISTE DES COURS
// ========================================

const CoursesList = () => {
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
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollCourse(courseId);
      alert('✅ Inscription réussie !');
      loadCourses(); // Recharger
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.detail || 'Inscription échouée'));
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Catalogue de cours</h2>
      {courses.map((course) => (
        <div key={course.id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <p>Catégorie: {course.category}</p>
          <p>Difficulté: {course.difficulty}</p>
          <p>Durée: {course.duration}</p>
          <button onClick={() => handleEnroll(course.id)}>
            S'inscrire
          </button>
        </div>
      ))}
    </div>
  );
};

// ========================================
// EXEMPLE 5 : MES COURS
// ========================================

const MyCourses = () => {
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const data = await courseService.getMyCourses();
      console.log('📖 Mes cours:', data);
      setMyCourses(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateProgress = async (enrollmentId, newProgress) => {
    try {
      await courseService.updateProgress(enrollmentId, newProgress);
      loadMyCourses(); // Recharger
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Mes cours en cours</h2>
      {myCourses.map((enrollment) => (
        <div key={enrollment.id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
          <h3>{enrollment.course.title}</h3>
          <p>Progression: {enrollment.progress}%</p>
          <div style={{ background: '#eee', height: '20px', borderRadius: '10px' }}>
            <div 
              style={{ 
                background: '#059669', 
                width: `${enrollment.progress}%`, 
                height: '100%',
                borderRadius: '10px'
              }}
            />
          </div>
          <button onClick={() => updateProgress(enrollment.id, enrollment.progress + 10)}>
            +10% progression
          </button>
        </div>
      ))}
    </div>
  );
};

// ========================================
// EXEMPLE 6 : DASHBOARD
// ========================================

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getDashboard();
      console.log('📊 Dashboard:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Mon Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>Heures d'apprentissage</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {dashboardData.learning_stats.total_hours}h
          </p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>Cours complétés</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {dashboardData.learning_stats.courses_completed}
          </p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>CO₂ compensé</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {dashboardData.user.carbon_offset} kg
          </p>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>Arbres plantés</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {dashboardData.user.trees_planted}
          </p>
        </div>
      </div>

      <h3>Cours récents</h3>
      {dashboardData.recent_courses.map((enrollment) => (
        <div key={enrollment.id}>
          <h4>{enrollment.course.title}</h4>
          <p>Progression: {enrollment.progress}%</p>
        </div>
      ))}
    </div>
  );
};

// ========================================
// EXEMPLE 7 : CALCUL CARBONE
// ========================================

const CarbonCalculator = () => {
  const [hours, setHours] = useState(10);
  const [category, setCategory] = useState('AI');
  const [result, setResult] = useState(null);

  const calculate = async () => {
    try {
      const data = await carbonService.calculateCarbon(hours, category);
      console.log('🌱 Résultat:', data);
      setResult(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Calculer l'empreinte carbone</h2>
      
      <input
        type="number"
        value={hours}
        onChange={(e) => setHours(Number(e.target.value))}
        placeholder="Heures d'apprentissage"
      />
      
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="AI">Intelligence Artificielle</option>
        <option value="Data Science">Data Science</option>
        <option value="Sustainability">Développement Durable</option>
        <option value="Business">Business</option>
      </select>
      
      <button onClick={calculate}>Calculer</button>

      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0' }}>
          <h3>Résultat</h3>
          <p>CO₂ compensé: {result.carbon_offset_kg} kg</p>
          <p>Équivalent arbres: {result.trees_equivalent}</p>
          <p>Équivalent voiture: {result.car_km_equivalent} km</p>
        </div>
      )}
    </div>
  );
};

// ========================================
// EXEMPLE 8 : PLANTER DES ARBRES
// ========================================

const TreePlanting = () => {
  const [count, setCount] = useState(1);
  const [location, setLocation] = useState('Amazon');

  const plantTrees = async () => {
    try {
      const result = await carbonService.plantTrees(count, location);
      console.log('🌳 Arbres plantés:', result);
      alert(`✅ ${count} arbre(s) planté(s) en ${location} !`);
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.detail || 'Plantation échouée'));
    }
  };

  return (
    <div>
      <h2>Planter des arbres</h2>
      
      <input
        type="number"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        min="1"
      />
      
      <select value={location} onChange={(e) => setLocation(e.target.value)}>
        <option value="Amazon">Amazonie</option>
        <option value="Mangrove">Mangrove</option>
        <option value="Savanna">Savane</option>
      </select>
      
      <button onClick={plantTrees}>Planter</button>
    </div>
  );
};

// ========================================
// EXPORTS
// ========================================

export {
  LoginForm,
  SignupForm,
  CourseGenerator,
  CoursesList,
  MyCourses,
  Dashboard,
  CarbonCalculator,
  TreePlanting,
};
