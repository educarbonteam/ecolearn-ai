import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Camera, BookOpen, Leaf, TrendingUp, Award, Clock, Target, Zap, TreePine, Users, Brain, ChevronRight, Play, Check, BarChart3, Sparkles, Send, Loader, Plus, X, Mail, Lock, User, Edit, Settings, Shield, Bell } from 'lucide-react';

// Données fictives
const FAKE_USER = {
  name: "Sophie Martin",
  email: "sophie.martin@example.com",
  avatar: "SM",
  totalLearningHours: 47.5,
  coursesCompleted: 12,
  carbonOffset: 142.8,
  treesPlanted: 28,
  streak: 15,
  level: "Éco-Apprenant Expert"
};

const FAKE_COURSES = [
  {
    id: 1,
    title: "Introduction à l'IA Responsable",
    category: "Intelligence Artificielle",
    duration: "4h 30min",
    progress: 75,
    carbonImpact: 12.4,
    instructor: "Dr. Marie Dubois",
    difficulty: "Débutant",
    modules: 8,
    enrolled: 1247
  },
  {
    id: 2,
    title: "Développement Durable en Entreprise",
    category: "Sustainability",
    duration: "6h 15min",
    progress: 100,
    carbonImpact: 18.7,
    instructor: "Jean-Luc Verdier",
    difficulty: "Intermédiaire",
    modules: 12,
    enrolled: 892
  },
  {
    id: 3,
    title: "Machine Learning pour la Transition Écologique",
    category: "Data Science",
    duration: "8h 00min",
    progress: 45,
    carbonImpact: 24.3,
    instructor: "Dr. Claire Fontaine",
    difficulty: "Avancé",
    modules: 15,
    enrolled: 654
  },
  {
    id: 4,
    title: "Économie Circulaire & Innovation",
    category: "Business",
    duration: "5h 20min",
    progress: 30,
    carbonImpact: 15.8,
    instructor: "Thomas Bernard",
    difficulty: "Intermédiaire",
    modules: 10,
    enrolled: 1089
  }
];

const CARBON_DATA = [
  { month: 'Jan', carbon: 25, trees: 5 },
  { month: 'Fév', carbon: 32, trees: 6 },
  { month: 'Mar', carbon: 41, trees: 8 },
  { month: 'Avr', carbon: 38, trees: 7 },
  { month: 'Mai', carbon: 52, trees: 10 },
  { month: 'Jun', carbon: 48, trees: 9 }
];

const LEARNING_STATS = [
  { day: 'Lun', hours: 2.5 },
  { day: 'Mar', hours: 1.8 },
  { day: 'Mer', hours: 3.2 },
  { day: 'Jeu', hours: 2.1 },
  { day: 'Ven', hours: 2.8 },
  { day: 'Sam', hours: 4.5 },
  { day: 'Dim', hours: 3.7 }
];

const IMPACT_DISTRIBUTION = [
  { name: 'Cours IA', value: 45, color: '#10b981' },
  { name: 'Sustainability', value: 30, color: '#059669' },
  { name: 'Data Science', value: 15, color: '#047857' },
  { name: 'Business', value: 10, color: '#065f46' }
];

const ACHIEVEMENTS = [
  { icon: TreePine, title: "Planteur d'Arbres", description: "25 arbres plantés", unlocked: true },
  { icon: Zap, title: "Apprenant Rapide", description: "10 cours complétés", unlocked: true },
  { icon: Target, title: "Série Parfaite", description: "15 jours consécutifs", unlocked: true },
  { icon: Award, title: "Éco-Champion", description: "100kg CO₂ compensés", unlocked: true },
  { icon: Brain, title: "Maître de l'IA", description: "Cours avancés terminés", unlocked: false },
  { icon: Users, title: "Ambassadeur", description: "Inviter 5 amis", unlocked: false }
];

const RECOMMENDED_COURSES = [
  {
    id: 5,
    title: "Green Computing & Optimisation Énergétique",
    duration: "3h 45min",
    level: "Intermédiaire",
    rating: 4.8,
    students: 2341
  },
  {
    id: 6,
    title: "Blockchain pour la Traçabilité Écologique",
    duration: "5h 30min",
    level: "Avancé",
    rating: 4.9,
    students: 1876
  },
  {
    id: 7,
    title: "Design Thinking pour l'Innovation Durable",
    duration: "4h 15min",
    level: "Débutant",
    rating: 4.7,
    students: 3102
  }
];

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Vérifier si l'utilisateur est connecté (simulation)
    const savedAuth = localStorage.getItem('ecolearn_auth');
    if (savedAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ecolearn_auth');
    setIsAuthenticated(false);
    setShowProfileMenu(false);
    setActiveView('dashboard');
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/mylogo.png" alt="Logo" className="nav-logo-image" />
          </div>
          
          {isAuthenticated && (
            <div className="nav-links">
              <button 
                className={activeView === 'dashboard' ? 'active' : ''} 
                onClick={() => setActiveView('dashboard')}
              >
                <BarChart3 size={18} />
                Dashboard
              </button>
              <button 
                className={activeView === 'generate' ? 'active' : ''} 
                onClick={() => setActiveView('generate')}
              >
                <Brain size={18} />
                Générer un Cours
              </button>
              <button 
                className={activeView === 'courses' ? 'active' : ''} 
                onClick={() => setActiveView('courses')}
              >
                <BookOpen size={18} />
                Mes Cours
              </button>
              <button 
                className={activeView === 'impact' ? 'active' : ''} 
                onClick={() => setActiveView('impact')}
              >
                <TreePine size={18} />
                Impact
              </button>
            </div>
          )}

          <div className="nav-user">
            {isAuthenticated ? (
              <div className="user-menu-wrapper">
                <div 
                  className="user-avatar-button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="user-avatar">{FAKE_USER.avatar}</div>
                  <span className="user-name">{FAKE_USER.name}</span>
                </div>
                
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <button 
                      className="profile-menu-item"
                      onClick={() => {
                        setActiveView('profile');
                        setShowProfileMenu(false);
                      }}
                    >
                      <Users size={18} />
                      Mon Profil
                    </button>
                    <button className="profile-menu-item">
                      <Target size={18} />
                      Paramètres
                    </button>
                    <div className="profile-menu-divider"></div>
                    <button 
                      className="profile-menu-item logout"
                      onClick={handleLogout}
                    >
                      <ChevronRight size={18} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="btn-secondary btn-small"
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                >
                  Connexion
                </button>
                <button 
                  className="btn-primary btn-small"
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                >
                  Créer un compte
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Landing */}
      {!mounted && (
        <header className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <Leaf size={16} />
              <span>Apprentissage Responsable</span>
            </div>
            <h1 className="hero-title">
              Apprenez intelligemment,
              <br />
              <span className="gradient-text">Compensez naturellement</span>
            </h1>
            <p className="hero-subtitle">
              Plateforme d'apprentissage alimentée par l'IA qui génère des parcours personnalisés
              et plante des arbres pour chaque session d'apprentissage.
            </p>
            <div className="hero-cta">
              <button className="btn-primary">
                <Play size={20} />
                Commencer gratuitement
              </button>
              <button className="btn-secondary">
                Découvrir l'impact
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <TreePine size={32} className="stat-icon" />
              <div className="stat-value">15,847</div>
              <div className="stat-label">Arbres plantés</div>
            </div>
            <div className="stat-card">
              <Users size={32} className="stat-icon" />
              <div className="stat-value">12,459</div>
              <div className="stat-label">Apprenants actifs</div>
            </div>
            <div className="stat-card">
              <BookOpen size={32} className="stat-icon" />
              <div className="stat-value">340+</div>
              <div className="stat-label">Cours disponibles</div>
            </div>
          </div>
        </header>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setIsAuthenticated(true);
            setShowAuthModal(false);
            localStorage.setItem('ecolearn_auth', 'true');
          }}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {!isAuthenticated ? (
          <LandingContent onGetStarted={() => {
            setAuthMode('signup');
            setShowAuthModal(true);
          }} />
        ) : (
          <>
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'generate' && <GenerateCourseView />}
            {activeView === 'courses' && <CoursesView />}
            {activeView === 'impact' && <ImpactView />}
            {activeView === 'profile' && <ProfileView user={FAKE_USER} />}
          </>
        )}
      </main>

      {/* Styles */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #059669;
          --primary-dark: #047857;
          --primary-light: #10b981;
          --accent: #f59e0b;
          --bg-main: #fafaf9;
          --bg-card: #ffffff;
          --text-primary: #1c1917;
          --text-secondary: #57534e;
          --text-tertiary: #a8a29e;
          --border: #e7e5e4;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
          --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);
          --gradient-eco: linear-gradient(135deg, #059669 0%, #10b981 100%);
          --gradient-warm: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        }

        body {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--bg-main);
          color: var(--text-primary);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        .app {
          min-height: 100vh;
        }

        /* Navigation */
        .navbar {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.9);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: auto;
          min-height: 80px;
          padding: 0.5rem 2rem;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-logo-image {
          height: 140px;
          width: auto;
          object-fit: contain;
          max-width: 400px;
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
        }

        .nav-links button {
          padding: 0.625rem 1.25rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.9375rem;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-links button:hover {
          background: rgba(5, 150, 105, 0.08);
          color: var(--primary);
        }

        .nav-links button.active {
          background: var(--gradient-eco);
          color: white;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: var(--gradient-eco);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        /* Hero Section */
        .hero {
          max-width: 1400px;
          margin: 0 auto;
          padding: 6rem 2rem 4rem;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 4rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(5, 150, 105, 0.1);
          border: 1px solid rgba(5, 150, 105, 0.2);
          border-radius: 50px;
          color: var(--primary);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .gradient-text {
          background: var(--gradient-eco);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 2.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn-primary, .btn-secondary {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: var(--gradient-eco);
          color: white;
          box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        }

        .btn-secondary {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .stat-card {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          border: 1px solid var(--border);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-light);
        }

        .stat-icon {
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9375rem;
          font-weight: 500;
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          gap: 2rem;
          animation: fadeInUp 0.6s ease-out;
        }

        .welcome-section {
          background: var(--gradient-eco);
          padding: 3rem;
          border-radius: 20px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .welcome-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          filter: blur(60px);
        }

        .welcome-content {
          position: relative;
          z-index: 1;
        }

        .welcome-greeting {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .welcome-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
        }

        .welcome-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .welcome-stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .welcome-stat-info h3 {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .welcome-stat-info p {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .metric-card {
          background: var(--bg-card);
          padding: 1.75rem;
          border-radius: 16px;
          border: 1px solid var(--border);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-light);
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .metric-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          background: rgba(5, 150, 105, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }

        .metric-label {
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }

        .metric-trend {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--primary);
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .chart-section {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--border);
          margin-top: 2rem;
        }

        .chart-header {
          margin-bottom: 2rem;
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .chart-subtitle {
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .achievements-section {
          margin-top: 2rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .achievement-card {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 14px;
          border: 1px solid var(--border);
          text-align: center;
          transition: all 0.3s ease;
          opacity: 1;
        }

        .achievement-card.locked {
          opacity: 0.5;
        }

        .achievement-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .achievement-icon {
          width: 56px;
          height: 56px;
          background: var(--gradient-eco);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1rem;
        }

        .achievement-card.locked .achievement-icon {
          background: var(--border);
          color: var(--text-tertiary);
        }

        .achievement-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          font-size: 0.9375rem;
        }

        .achievement-description {
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        /* Courses View */
        .courses-header {
          margin-bottom: 2rem;
        }

        .courses-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .courses-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .courses-grid {
          display: grid;
          gap: 1.5rem;
        }

        .course-card {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: all 0.3s ease;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }

        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-light);
        }

        .course-thumbnail {
          background: var(--gradient-eco);
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .course-thumbnail::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          filter: blur(40px);
        }

        .course-content {
          padding: 2rem 2rem 2rem 0;
        }

        .course-header {
          margin-bottom: 1.5rem;
        }

        .course-category {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background: rgba(5, 150, 105, 0.1);
          color: var(--primary);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .course-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .course-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .course-meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .progress-section {
          margin-bottom: 1.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .progress-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .progress-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--primary);
        }

        .progress-bar {
          height: 8px;
          background: rgba(5, 150, 105, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-eco);
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .course-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .carbon-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 8px;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .course-action {
          padding: 0.75rem 1.5rem;
          background: var(--gradient-eco);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .course-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .recommended-section {
          margin-top: 3rem;
        }

        .recommended-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .recommended-card {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 14px;
          border: 1px solid var(--border);
          transition: all 0.3s ease;
        }

        .recommended-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .recommended-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .recommended-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--accent);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .recommended-meta {
          display: flex;
          gap: 1rem;
          color: var(--text-secondary);
          font-size: 0.8125rem;
          margin-bottom: 1rem;
        }

        .level-badge {
          padding: 0.25rem 0.625rem;
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent);
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Impact View */
        .impact-hero {
          background: var(--gradient-eco);
          padding: 3rem;
          border-radius: 20px;
          color: white;
          text-align: center;
          margin-bottom: 2rem;
        }

        .impact-hero h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .impact-hero p {
          font-size: 1.125rem;
          opacity: 0.9;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .impact-card {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .impact-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .impact-icon {
          width: 56px;
          height: 56px;
          background: var(--gradient-eco);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .impact-card-title {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .impact-value {
          font-size: 3rem;
          font-weight: 800;
          background: var(--gradient-eco);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .impact-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-container {
            padding: 0 1rem;
          }

          .nav-links {
            display: none;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .course-card {
            grid-template-columns: 1fr;
          }

          .course-thumbnail {
            padding: 2rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Generate Course Styles */
        .generate-container {
          max-width: 900px;
          margin: 0 auto;
          animation: fadeInUp 0.6s ease-out;
        }

        .generate-header {
          background: var(--bg-card);
          padding: 2.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          margin-bottom: 2rem;
        }

        .generate-title-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .generate-icon-wrapper {
          width: 64px;
          height: 64px;
          background: var(--gradient-eco);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .generate-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .generate-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .progress-steps::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: var(--border);
          z-index: 0;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-main);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-tertiary);
          transition: all 0.3s ease;
        }

        .progress-step.active .step-number {
          background: var(--gradient-eco);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .progress-step.completed .step-number {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .step-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-tertiary);
        }

        .progress-step.active .step-label {
          color: var(--primary);
        }

        .step-content {
          background: var(--bg-card);
          padding: 3rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          animation: fadeInUp 0.4s ease-out;
        }

        .step-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          text-align: center;
        }

        .step-description {
          color: var(--text-secondary);
          font-size: 1.125rem;
          text-align: center;
          margin-bottom: 3rem;
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.25rem;
          margin-bottom: 3rem;
        }

        .subject-card {
          background: var(--bg-main);
          padding: 2rem 1.5rem;
          border-radius: 16px;
          border: 2px solid var(--border);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .subject-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary-light);
          box-shadow: var(--shadow-md);
        }

        .subject-card.selected {
          background: rgba(5, 150, 105, 0.08);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .popular-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: var(--gradient-warm);
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.25rem 0.625rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .subject-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .subject-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9375rem;
        }

        .levels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .level-card {
          background: var(--bg-main);
          padding: 2rem;
          border-radius: 16px;
          border: 2px solid var(--border);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .level-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .level-card.selected {
          background: rgba(5, 150, 105, 0.08);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .level-indicator {
          width: 48px;
          height: 6px;
          border-radius: 3px;
          margin-bottom: 1.5rem;
        }

        .level-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .level-description {
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .preference-section {
          margin-bottom: 3rem;
        }

        .preference-label {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        .durations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .duration-card {
          background: var(--bg-main);
          padding: 1.75rem;
          border-radius: 14px;
          border: 2px solid var(--border);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .duration-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .duration-card.selected {
          background: rgba(5, 150, 105, 0.08);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .duration-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .duration-name {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .duration-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .styles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
        }

        .style-card {
          background: var(--bg-main);
          padding: 1.75rem;
          border-radius: 14px;
          border: 2px solid var(--border);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .style-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .style-card.selected {
          background: rgba(5, 150, 105, 0.08);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .style-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .style-name {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 0.9375rem;
        }

        .style-description {
          color: var(--text-secondary);
          font-size: 0.8125rem;
        }

        .prerequisites-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .prerequisite-tag {
          padding: 0.625rem 1.25rem;
          background: var(--bg-main);
          border: 2px solid var(--border);
          border-radius: 25px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .prerequisite-tag:hover {
          border-color: var(--primary);
          background: rgba(5, 150, 105, 0.05);
        }

        .prerequisite-tag.selected {
          background: var(--gradient-eco);
          color: white;
          border-color: var(--primary);
        }

        .goals-section {
          margin-bottom: 2rem;
        }

        .goals-textarea {
          width: 100%;
          padding: 1.5rem;
          border: 2px solid var(--border);
          border-radius: 14px;
          font-family: inherit;
          font-size: 1rem;
          color: var(--text-primary);
          resize: vertical;
          transition: all 0.3s ease;
          background: var(--bg-main);
        }

        .goals-textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .goals-suggestions {
          margin-top: 1.5rem;
        }

        .suggestion-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .suggestion-tag {
          padding: 0.625rem 1.25rem;
          background: var(--bg-main);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.875rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .suggestion-tag:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(5, 150, 105, 0.05);
        }

        .summary-card {
          background: var(--bg-main);
          padding: 2rem;
          border-radius: 14px;
          border: 1px solid var(--border);
          margin-bottom: 2rem;
        }

        .summary-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .summary-items {
          display: grid;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .summary-value {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9375rem;
        }

        .step-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.0625rem;
        }

        .btn-generate {
          background: var(--gradient-eco);
          box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3);
        }

        .btn-generate:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary:disabled:hover,
        .btn-secondary:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        /* Generating State */
        .generating-state {
          background: var(--bg-card);
          padding: 4rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          text-align: center;
          animation: fadeInUp 0.4s ease-out;
        }

        .generating-animation {
          margin-bottom: 2rem;
        }

        .spinner {
          color: var(--primary);
          animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .generating-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .generating-description {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin-bottom: 3rem;
        }

        .generating-steps {
          max-width: 400px;
          margin: 0 auto;
          display: grid;
          gap: 1.25rem;
        }

        .generating-step {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-main);
          border-radius: 10px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .generating-step.active {
          background: rgba(5, 150, 105, 0.08);
          color: var(--primary);
          border: 1px solid rgba(5, 150, 105, 0.2);
        }

        .step-check {
          color: var(--primary);
        }

        .step-loader {
          animation: spin 1s linear infinite;
        }

        .step-pending {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--border);
        }

        /* Generated Course */
        .success-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: var(--gradient-eco);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
        }

        .success-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .success-description {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .generated-course-card {
          background: var(--bg-main);
          border-radius: 16px;
          padding: 2.5rem;
          border: 1px solid var(--border);
          margin-bottom: 2rem;
        }

        .course-generated-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 2.5rem;
          gap: 2rem;
        }

        .course-generated-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .course-generated-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .course-badges {
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .course-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .course-badge.primary {
          background: rgba(5, 150, 105, 0.1);
          color: var(--primary);
        }

        .course-badge.success {
          background: rgba(16, 185, 129, 0.1);
          color: var(--primary-light);
        }

        .modules-list {
          margin-bottom: 2.5rem;
        }

        .modules-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .module-item {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border);
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .module-item:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--primary-light);
        }

        .module-number {
          width: 40px;
          height: 40px;
          background: var(--gradient-eco);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .module-content {
          flex: 1;
        }

        .module-header-content {
          margin-bottom: 1rem;
        }

        .module-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.625rem;
        }

        .module-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .module-duration,
        .module-carbon {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .module-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .topic-tag {
          padding: 0.375rem 0.75rem;
          background: rgba(5, 150, 105, 0.08);
          color: var(--primary);
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .impact-preview {
          background: rgba(5, 150, 105, 0.05);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(5, 150, 105, 0.2);
        }

        .impact-preview-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .impact-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
        }

        .impact-stat {
          text-align: center;
        }

        .impact-stat-icon {
          color: var(--primary);
          margin-bottom: 0.75rem;
        }

        .impact-stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .impact-stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .final-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* Auth Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-container {
          background: var(--bg-card);
          border-radius: 24px;
          padding: 3rem;
          max-width: 480px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 40px;
          height: 40px;
          border: none;
          background: var(--bg-main);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: var(--border);
          color: var(--text-primary);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .modal-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .modal-logo-image {
          height: 200px;
          width: auto;
          object-fit: contain;
          max-width: 600px;
        }

        .modal-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .modal-subtitle {
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .auth-form {
          display: grid;
          gap: 1.5rem;
        }

        .form-group {
          display: grid;
          gap: 0.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .form-input {
          padding: 0.875rem 1rem;
          border: 2px solid var(--border);
          border-radius: 10px;
          font-size: 1rem;
          color: var(--text-primary);
          background: var(--bg-main);
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .form-error {
          color: #ef4444;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .form-extras {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .checkbox-label input {
          cursor: pointer;
        }

        .forgot-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .btn-full {
          width: 100%;
          justify-content: center;
        }

        .btn-small {
          padding: 0.625rem 1.25rem;
          font-size: 0.9375rem;
        }

        .auth-divider {
          position: relative;
          text-align: center;
          margin: 0.5rem 0;
        }

        .auth-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border);
        }

        .auth-divider span {
          position: relative;
          background: var(--bg-card);
          padding: 0 1rem;
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }

        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          border: 2px solid var(--border);
          background: var(--bg-card);
          border-radius: 10px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .social-btn:hover {
          border-color: var(--primary-light);
          background: var(--bg-main);
        }

        .auth-switch {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .switch-link {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .switch-link:hover {
          text-decoration: underline;
        }

        .auth-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .user-menu-wrapper {
          position: relative;
        }

        .user-avatar-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 12px;
          transition: background 0.3s ease;
        }

        .user-avatar-button:hover {
          background: var(--bg-main);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 0.5rem;
          min-width: 220px;
          box-shadow: var(--shadow-lg);
          animation: slideDown 0.3s ease;
          z-index: 100;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          width: 100%;
          transition: all 0.3s ease;
        }

        .profile-menu-item:hover {
          background: var(--bg-main);
        }

        .profile-menu-item.logout {
          color: #ef4444;
        }

        .profile-menu-divider {
          height: 1px;
          background: var(--border);
          margin: 0.5rem 0;
        }

        /* Landing Content */
        .landing-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .landing-hero {
          text-align: center;
          margin-bottom: 5rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: var(--bg-card);
          padding: 2.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-light);
        }

        .feature-icon {
          width: 72px;
          height: 72px;
          background: var(--gradient-eco);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1.5rem;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Profile Styles */
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeInUp 0.6s ease-out;
        }

        .profile-header-card {
          background: var(--bg-card);
          border-radius: 20px;
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .profile-cover {
          height: 180px;
          background: var(--gradient-eco);
          position: relative;
        }

        .profile-info-section {
          padding: 0 2.5rem 2.5rem;
          display: flex;
          gap: 2rem;
          align-items: start;
          margin-top: -60px;
          position: relative;
        }

        .profile-avatar-large {
          width: 120px;
          height: 120px;
          background: var(--gradient-eco);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2.5rem;
          font-weight: 700;
          border: 5px solid var(--bg-card);
          flex-shrink: 0;
          position: relative;
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 36px;
          height: 36px;
          background: var(--bg-card);
          border: 2px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .avatar-edit-btn:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .profile-header-content {
          flex: 1;
        }

        .profile-name-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .profile-name {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .profile-badge-level {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.875rem;
          background: var(--gradient-eco);
          color: white;
          border-radius: 20px;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .profile-email {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .profile-stats-row {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .profile-stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .profile-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .profile-card {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .profile-card-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .profile-bio {
          color: var(--text-secondary);
          line-height: 1.7;
        }

        .profile-textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid var(--border);
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.9375rem;
          color: var(--text-primary);
          resize: vertical;
          background: var(--bg-main);
        }

        .profile-textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .profile-details {
          display: grid;
          gap: 1.25rem;
        }

        .profile-detail-item {
          display: flex;
          gap: 1rem;
        }

        .detail-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .detail-content {
          display: grid;
          gap: 0.25rem;
          flex: 1;
        }

        .detail-label {
          font-size: 0.8125rem;
          color: var(--text-tertiary);
          font-weight: 600;
        }

        .detail-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .detail-input {
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.9375rem;
          color: var(--text-primary);
          background: var(--bg-main);
        }

        .detail-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .interests-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .interest-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(5, 150, 105, 0.1);
          color: var(--primary);
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .interest-remove {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .interest-add {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: var(--bg-main);
          border: 2px dashed var(--border);
          border-radius: 20px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .interest-add:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .activity-list {
          display: grid;
          gap: 1.25rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-icon.completed {
          background: rgba(16, 185, 129, 0.1);
          color: var(--primary);
        }

        .activity-icon.tree {
          background: rgba(5, 150, 105, 0.1);
          color: var(--primary-dark);
        }

        .activity-icon.achievement {
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent);
        }

        .activity-icon.course {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          color: var(--text-primary);
          font-size: 0.9375rem;
          margin-bottom: 0.25rem;
        }

        .activity-time {
          font-size: 0.8125rem;
          color: var(--text-tertiary);
        }

        .settings-list {
          display: grid;
          gap: 0.5rem;
        }

        .setting-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-main);
          border: none;
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .setting-item:hover {
          background: rgba(5, 150, 105, 0.05);
        }

        .setting-item svg:first-child {
          color: var(--primary);
        }

        .setting-item svg:last-child {
          margin-left: auto;
          color: var(--text-tertiary);
        }

        .profile-left-column,
        .profile-right-column {
          display: grid;
          gap: 1.5rem;
          align-content: start;
        }

        /* Responsive Profile */
        @media (max-width: 968px) {
          .profile-content-grid {
            grid-template-columns: 1fr;
          }

          .profile-info-section {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-header-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

// Auth Modal Component
const AuthModal = ({ mode, onClose, onSuccess, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (mode === 'signup') {
      if (!formData.name) newErrors.name = 'Le nom est requis';
      if (!formData.email) newErrors.email = 'L\'email est requis';
      if (!formData.password) newErrors.password = 'Le mot de passe est requis';
      if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    } else {
      if (!formData.email) newErrors.email = 'L\'email est requis';
      if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      // Simulation de connexion
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="modal-logo">
            <img src="/mylogo.png" alt="Logo" className="modal-logo-image" />
          </div>
          <h2 className="modal-title">
            {mode === 'login' ? 'Bienvenue !' : 'Créer un compte'}
          </h2>
          <p className="modal-subtitle">
            {mode === 'login' 
              ? 'Connectez-vous pour continuer votre apprentissage' 
              : 'Rejoignez notre communauté d\'apprenants éco-responsables'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                Nom complet
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Sophie Martin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="sophie.martin@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={18} />
              Mot de passe
            </label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          )}

          {mode === 'login' && (
            <div className="form-extras">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <a href="#" className="forgot-link">Mot de passe oublié ?</a>
            </div>
          )}

          <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader size={20} className="spinner" />
                Connexion en cours...
              </>
            ) : (
              <>
                {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                <ChevronRight size={20} />
              </>
            )}
          </button>

          <div className="auth-divider">
            <span>ou continuer avec</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-btn">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
              </svg>
              Google
            </button>
            <button type="button" className="social-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#1877F2">
                <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="auth-switch">
            {mode === 'login' ? (
              <p>
                Pas encore de compte ?{' '}
                <button type="button" onClick={onSwitchMode} className="switch-link">
                  Créer un compte
                </button>
              </p>
            ) : (
              <p>
                Déjà inscrit ?{' '}
                <button type="button" onClick={onSwitchMode} className="switch-link">
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Landing Content Component
const LandingContent = ({ onGetStarted }) => {
  return (
    <div className="landing-content">
      <div className="landing-hero">
        <div className="hero-badge">
          <Leaf size={16} />
          <span>Apprentissage Responsable</span>
        </div>
        <h1 className="hero-title">
          Apprenez intelligemment,
          <br />
          <span className="gradient-text">Compensez naturellement</span>
        </h1>
        <p className="hero-subtitle">
          Plateforme d'apprentissage alimentée par l'IA qui génère des parcours personnalisés
          et plante des arbres pour chaque session d'apprentissage.
        </p>
        <button className="btn-primary btn-large" onClick={onGetStarted}>
          <Play size={20} />
          Commencer gratuitement
        </button>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <Brain size={32} />
          </div>
          <h3 className="feature-title">IA Personnalisée</h3>
          <p className="feature-description">
            Notre IA génère des parcours d'apprentissage adaptés à vos objectifs et votre niveau
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <TreePine size={32} />
          </div>
          <h3 className="feature-title">Impact Écologique</h3>
          <p className="feature-description">
            Chaque session d'apprentissage contribue à la plantation d'arbres
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <BarChart3 size={32} />
          </div>
          <h3 className="feature-title">Suivi Détaillé</h3>
          <p className="feature-description">
            Visualisez votre progression et votre impact environnemental en temps réel
          </p>
        </div>
      </div>
    </div>
  );
};

// Profile View Component
const ProfileView = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    bio: 'Passionnée par l\'IA et le développement durable. Je cherche à combiner technologie et responsabilité environnementale.',
    location: 'Paris, France',
    website: 'sophiemartin.dev',
    interests: ['Intelligence Artificielle', 'Sustainability', 'Data Science', 'Cloud Computing']
  });

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar-large">
            {user.avatar}
            <button className="avatar-edit-btn">
              <Camera size={18} />
            </button>
          </div>
          <div className="profile-header-content">
            <div className="profile-name-section">
              <h2 className="profile-name">{profileData.name}</h2>
              <div className="profile-badge-level">
                <Award size={16} />
                {user.level}
              </div>
            </div>
            <p className="profile-email">{profileData.email}</p>
            <div className="profile-stats-row">
              <div className="profile-stat-item">
                <Clock size={16} />
                <span>{user.totalLearningHours}h d'apprentissage</span>
              </div>
              <div className="profile-stat-item">
                <TreePine size={16} />
                <span>{user.treesPlanted} arbres plantés</span>
              </div>
              <div className="profile-stat-item">
                <Target size={16} />
                <span>Série de {user.streak} jours</span>
              </div>
            </div>
          </div>
          <button 
            className="btn-secondary"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit size={18} />
            {isEditing ? 'Annuler' : 'Modifier le profil'}
          </button>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Left Column */}
        <div className="profile-left-column">
          {/* About Section */}
          <div className="profile-card">
            <h3 className="profile-card-title">À propos</h3>
            {isEditing ? (
              <textarea
                className="profile-textarea"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={4}
              />
            ) : (
              <p className="profile-bio">{profileData.bio}</p>
            )}
          </div>

          {/* Details Section */}
          <div className="profile-card">
            <h3 className="profile-card-title">Informations</h3>
            <div className="profile-details">
              <div className="profile-detail-item">
                <Users size={18} className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Localisation</span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                  ) : (
                    <span className="detail-value">{profileData.location}</span>
                  )}
                </div>
              </div>
              <div className="profile-detail-item">
                <Leaf size={18} className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Site web</span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="detail-input"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    />
                  ) : (
                    <span className="detail-value">{profileData.website}</span>
                  )}
                </div>
              </div>
              <div className="profile-detail-item">
                <BookOpen size={18} className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Membre depuis</span>
                  <span className="detail-value">Janvier 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="profile-card">
            <h3 className="profile-card-title">Centres d'intérêt</h3>
            <div className="interests-tags">
              {profileData.interests.map((interest, index) => (
                <span key={index} className="interest-tag">
                  {interest}
                  {isEditing && (
                    <button className="interest-remove">
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
              {isEditing && (
                <button className="interest-add">
                  <Plus size={16} />
                  Ajouter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right-column">
          {/* Recent Activity */}
          <div className="profile-card">
            <h3 className="profile-card-title">Activité Récente</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon completed">
                  <Check size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    Cours <strong>Introduction à l'IA Responsable</strong> terminé
                  </p>
                  <span className="activity-time">Il y a 2 heures</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon tree">
                  <TreePine size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>3 arbres</strong> plantés grâce à votre apprentissage
                  </p>
                  <span className="activity-time">Il y a 5 heures</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon achievement">
                  <Award size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    Badge <strong>Série Parfaite</strong> débloqué
                  </p>
                  <span className="activity-time">Hier</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon course">
                  <Play size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    Nouveau cours <strong>Machine Learning</strong> démarré
                  </p>
                  <span className="activity-time">Il y a 3 jours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Quick Access */}
          <div className="profile-card">
            <h3 className="profile-card-title">Paramètres</h3>
            <div className="settings-list">
              <button className="setting-item">
                <Shield size={20} />
                <span>Confidentialité et sécurité</span>
                <ChevronRight size={18} />
              </button>
              <button className="setting-item">
                <Bell size={20} />
                <span>Notifications</span>
                <ChevronRight size={18} />
              </button>
              <button className="setting-item">
                <Settings size={20} />
                <span>Préférences d'apprentissage</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {isEditing && (
            <button 
              className="btn-primary btn-full"
              onClick={() => setIsEditing(false)}
            >
              <Check size={20} />
              Enregistrer les modifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Generate Course Component
const GenerateCourseView = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: '',
    level: '',
    duration: '',
    goals: '',
    learningStyle: '',
    prerequisites: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);

  const subjects = [
    { id: 'ai', name: 'Intelligence Artificielle', icon: '🤖', popular: true },
    { id: 'sustainability', name: 'Développement Durable', icon: '♻️', popular: true },
    { id: 'data', name: 'Data Science', icon: '📊', popular: true },
    { id: 'blockchain', name: 'Blockchain', icon: '⛓️', popular: false },
    { id: 'cloud', name: 'Cloud Computing', icon: '☁️', popular: false },
    { id: 'iot', name: 'Internet des Objets', icon: '📡', popular: false },
    { id: 'cybersecurity', name: 'Cybersécurité', icon: '🔒', popular: false },
    { id: 'design', name: 'UX/UI Design', icon: '🎨', popular: false }
  ];

  const levels = [
    { id: 'beginner', name: 'Débutant', description: 'Aucune expérience requise', color: '#10b981' },
    { id: 'intermediate', name: 'Intermédiaire', description: 'Connaissances de base', color: '#f59e0b' },
    { id: 'advanced', name: 'Avancé', description: 'Expérience solide', color: '#ef4444' }
  ];

  const durations = [
    { id: 'short', name: '2-4 heures', description: 'Cours intensif', icon: '⚡' },
    { id: 'medium', name: '5-8 heures', description: 'Cours standard', icon: '📚' },
    { id: 'long', name: '10+ heures', description: 'Cours approfondi', icon: '🎓' }
  ];

  const learningStyles = [
    { id: 'visual', name: 'Visuel', description: 'Diagrammes et vidéos', icon: '👁️' },
    { id: 'practical', name: 'Pratique', description: 'Exercices hands-on', icon: '🛠️' },
    { id: 'theoretical', name: 'Théorique', description: 'Concepts et lectures', icon: '📖' },
    { id: 'mixed', name: 'Mixte', description: 'Approche équilibrée', icon: '🎯' }
  ];

  const availablePrerequisites = [
    'Python', 'JavaScript', 'Mathématiques', 'Statistiques', 
    'Machine Learning', 'SQL', 'Git', 'Docker', 'React', 'Node.js'
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulation de génération par IA
    setTimeout(() => {
      const course = {
        title: `${formData.subject} pour ${formData.level}`,
        description: `Cours personnalisé de ${formData.duration} généré par IA selon vos objectifs: ${formData.goals}`,
        modules: [
          {
            id: 1,
            title: 'Introduction et Fondamentaux',
            duration: '45 min',
            topics: ['Concepts de base', 'Terminologie', 'Contexte historique'],
            carbonImpact: 1.2
          },
          {
            id: 2,
            title: 'Concepts Avancés',
            duration: '1h 30min',
            topics: ['Techniques principales', 'Best practices', 'Cas d\'usage'],
            carbonImpact: 2.8
          },
          {
            id: 3,
            title: 'Mise en Pratique',
            duration: '2h 15min',
            topics: ['Projet guidé', 'Exercices pratiques', 'Études de cas'],
            carbonImpact: 3.5
          },
          {
            id: 4,
            title: 'Projet Final et Certification',
            duration: '1h 30min',
            topics: ['Projet capstone', 'Évaluation', 'Certification'],
            carbonImpact: 2.1
          }
        ],
        totalDuration: '6h 00min',
        estimatedCarbon: 9.6,
        treesToPlant: 2,
        difficulty: formData.level,
        learningStyle: formData.learningStyle
      };
      
      setGeneratedCourse(course);
      setIsGenerating(false);
      setStep(5);
    }, 3000);
  };

  const togglePrerequisite = (prereq) => {
    if (selectedPrerequisites.includes(prereq)) {
      setSelectedPrerequisites(selectedPrerequisites.filter(p => p !== prereq));
    } else {
      setSelectedPrerequisites([...selectedPrerequisites, prereq]);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      subject: '',
      level: '',
      duration: '',
      goals: '',
      learningStyle: '',
      prerequisites: []
    });
    setGeneratedCourse(null);
    setSelectedPrerequisites([]);
  };

  return (
    <div className="generate-container">
      {/* Header */}
      <div className="generate-header">
        <div className="generate-title-section">
          <div className="generate-icon-wrapper">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="generate-title">Générateur de Cours IA</h2>
            <p className="generate-subtitle">
              Créez votre parcours d'apprentissage personnalisé en quelques étapes
            </p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="progress-steps">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className={`progress-step ${step >= num ? 'active' : ''} ${step > num ? 'completed' : ''}`}>
              <div className="step-number">{step > num ? <Check size={16} /> : num}</div>
              <div className="step-label">
                {num === 1 && 'Sujet'}
                {num === 2 && 'Niveau'}
                {num === 3 && 'Préférences'}
                {num === 4 && 'Objectifs'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Subject Selection */}
      {step === 1 && (
        <div className="step-content">
          <h3 className="step-title">Choisissez votre domaine d'apprentissage</h3>
          <p className="step-description">Sélectionnez le sujet qui vous intéresse</p>
          
          <div className="subjects-grid">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`subject-card ${formData.subject === subject.name ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, subject: subject.name })}
              >
                {subject.popular && <div className="popular-badge">Populaire</div>}
                <div className="subject-icon">{subject.icon}</div>
                <div className="subject-name">{subject.name}</div>
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button 
              className="btn-primary btn-large"
              disabled={!formData.subject}
              onClick={() => setStep(2)}
            >
              Continuer
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Level Selection */}
      {step === 2 && (
        <div className="step-content">
          <h3 className="step-title">Quel est votre niveau actuel ?</h3>
          <p className="step-description">Nous adapterons le contenu à votre expérience</p>
          
          <div className="levels-grid">
            {levels.map((level) => (
              <div
                key={level.id}
                className={`level-card ${formData.level === level.name ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, level: level.name })}
              >
                <div className="level-indicator" style={{ background: level.color }}></div>
                <div className="level-name">{level.name}</div>
                <div className="level-description">{level.description}</div>
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Retour
            </button>
            <button 
              className="btn-primary btn-large"
              disabled={!formData.level}
              onClick={() => setStep(3)}
            >
              Continuer
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div className="step-content">
          <h3 className="step-title">Personnalisez votre apprentissage</h3>
          <p className="step-description">Définissez la durée et le style d'apprentissage</p>
          
          <div className="preference-section">
            <h4 className="preference-label">Durée souhaitée</h4>
            <div className="durations-grid">
              {durations.map((duration) => (
                <div
                  key={duration.id}
                  className={`duration-card ${formData.duration === duration.name ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, duration: duration.name })}
                >
                  <div className="duration-icon">{duration.icon}</div>
                  <div className="duration-name">{duration.name}</div>
                  <div className="duration-description">{duration.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="preference-section">
            <h4 className="preference-label">Style d'apprentissage</h4>
            <div className="styles-grid">
              {learningStyles.map((style) => (
                <div
                  key={style.id}
                  className={`style-card ${formData.learningStyle === style.name ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, learningStyle: style.name })}
                >
                  <div className="style-icon">{style.icon}</div>
                  <div className="style-name">{style.name}</div>
                  <div className="style-description">{style.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="preference-section">
            <h4 className="preference-label">Prérequis (optionnel)</h4>
            <div className="prerequisites-container">
              {availablePrerequisites.map((prereq) => (
                <button
                  key={prereq}
                  className={`prerequisite-tag ${selectedPrerequisites.includes(prereq) ? 'selected' : ''}`}
                  onClick={() => togglePrerequisite(prereq)}
                >
                  {prereq}
                  {selectedPrerequisites.includes(prereq) && <X size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Retour
            </button>
            <button 
              className="btn-primary btn-large"
              disabled={!formData.duration || !formData.learningStyle}
              onClick={() => setStep(4)}
            >
              Continuer
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Goals */}
      {step === 4 && (
        <div className="step-content">
          <h3 className="step-title">Quels sont vos objectifs ?</h3>
          <p className="step-description">Décrivez ce que vous souhaitez accomplir avec ce cours</p>
          
          <div className="goals-section">
            <textarea
              className="goals-textarea"
              placeholder="Exemple: Je veux comprendre les bases du machine learning pour pouvoir créer mes premiers modèles de classification et prédiction. Mon objectif est de pouvoir travailler sur des projets concrets dans mon entreprise..."
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              rows={8}
            />
            
            <div className="goals-suggestions">
              <div className="suggestion-label">Suggestions d'objectifs:</div>
              <div className="suggestion-tags">
                <button 
                  className="suggestion-tag"
                  onClick={() => setFormData({ ...formData, goals: 'Maîtriser les concepts fondamentaux et être capable de les appliquer dans des projets réels' })}
                >
                  Maîtrise pratique
                </button>
                <button 
                  className="suggestion-tag"
                  onClick={() => setFormData({ ...formData, goals: 'Obtenir une certification reconnue pour valoriser mon CV professionnel' })}
                >
                  Certification professionnelle
                </button>
                <button 
                  className="suggestion-tag"
                  onClick={() => setFormData({ ...formData, goals: 'Changer de carrière et acquérir les compétences nécessaires pour un nouveau poste' })}
                >
                  Reconversion
                </button>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h4 className="summary-title">Récapitulatif de votre cours</h4>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">Sujet:</span>
                <span className="summary-value">{formData.subject}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Niveau:</span>
                <span className="summary-value">{formData.level}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Durée:</span>
                <span className="summary-value">{formData.duration}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Style:</span>
                <span className="summary-value">{formData.learningStyle}</span>
              </div>
              {selectedPrerequisites.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">Prérequis:</span>
                  <span className="summary-value">{selectedPrerequisites.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setStep(3)}>
              Retour
            </button>
            <button 
              className="btn-primary btn-large btn-generate"
              disabled={!formData.goals || formData.goals.length < 20}
              onClick={handleGenerate}
            >
              <Sparkles size={20} />
              Générer mon cours IA
            </button>
          </div>
        </div>
      )}

      {/* Generating State */}
      {isGenerating && (
        <div className="generating-state">
          <div className="generating-animation">
            <Loader size={64} className="spinner" />
          </div>
          <h3 className="generating-title">Génération de votre cours personnalisé...</h3>
          <p className="generating-description">
            Notre IA analyse vos préférences et crée un parcours d'apprentissage optimal
          </p>
          <div className="generating-steps">
            <div className="generating-step">
              <Check size={20} className="step-check" />
              Analyse de vos objectifs
            </div>
            <div className="generating-step active">
              <Loader size={20} className="step-loader" />
              Création du contenu pédagogique
            </div>
            <div className="generating-step">
              <div className="step-pending"></div>
              Calcul de l'empreinte carbone
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Generated Course */}
      {step === 5 && generatedCourse && (
        <div className="step-content">
          <div className="success-header">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h3 className="success-title">Votre cours est prêt ! 🎉</h3>
            <p className="success-description">
              Parcours personnalisé généré avec succès par notre IA
            </p>
          </div>

          <div className="generated-course-card">
            <div className="course-generated-header">
              <div>
                <h2 className="course-generated-title">{generatedCourse.title}</h2>
                <p className="course-generated-description">{generatedCourse.description}</p>
              </div>
              <div className="course-badges">
                <div className="course-badge primary">
                  <Clock size={18} />
                  {generatedCourse.totalDuration}
                </div>
                <div className="course-badge success">
                  <TreePine size={18} />
                  {generatedCourse.treesToPlant} arbres
                </div>
              </div>
            </div>

            <div className="modules-list">
              <h4 className="modules-title">Modules du cours</h4>
              {generatedCourse.modules.map((module, index) => (
                <div key={module.id} className="module-item">
                  <div className="module-number">{index + 1}</div>
                  <div className="module-content">
                    <div className="module-header-content">
                      <h5 className="module-title">{module.title}</h5>
                      <div className="module-meta">
                        <span className="module-duration">
                          <Clock size={14} />
                          {module.duration}
                        </span>
                        <span className="module-carbon">
                          <Leaf size={14} />
                          {module.carbonImpact} kg CO₂
                        </span>
                      </div>
                    </div>
                    <div className="module-topics">
                      {module.topics.map((topic, idx) => (
                        <span key={idx} className="topic-tag">{topic}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="impact-preview">
              <h4 className="impact-preview-title">Impact Environnemental Estimé</h4>
              <div className="impact-stats">
                <div className="impact-stat">
                  <Leaf size={32} className="impact-stat-icon" />
                  <div className="impact-stat-value">{generatedCourse.estimatedCarbon} kg</div>
                  <div className="impact-stat-label">CO₂ à compenser</div>
                </div>
                <div className="impact-stat">
                  <TreePine size={32} className="impact-stat-icon" />
                  <div className="impact-stat-value">{generatedCourse.treesToPlant}</div>
                  <div className="impact-stat-label">Arbres à planter</div>
                </div>
                <div className="impact-stat">
                  <Target size={32} className="impact-stat-icon" />
                  <div className="impact-stat-value">100%</div>
                  <div className="impact-stat-label">Compensé</div>
                </div>
              </div>
            </div>
          </div>

          <div className="final-actions">
            <button className="btn-secondary btn-large" onClick={resetForm}>
              <Plus size={20} />
              Créer un nouveau cours
            </button>
            <button className="btn-primary btn-large">
              <Play size={20} />
              Commencer maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Component
const DashboardView = () => {
  return (
    <div className="dashboard-grid">
      <div className="welcome-section">
        <div className="welcome-content">
          <h2 className="welcome-greeting">Bonjour, {FAKE_USER.name}! 👋</h2>
          <p className="welcome-subtitle">Voici votre impact d'apprentissage aujourd'hui</p>
          
          <div className="welcome-stats">
            <div className="welcome-stat">
              <div className="welcome-stat-icon">
                <Clock size={24} />
              </div>
              <div className="welcome-stat-info">
                <h3>{FAKE_USER.totalLearningHours}h</h3>
                <p>Temps d'apprentissage</p>
              </div>
            </div>
            <div className="welcome-stat">
              <div className="welcome-stat-icon">
                <TreePine size={24} />
              </div>
              <div className="welcome-stat-info">
                <h3>{FAKE_USER.treesPlanted}</h3>
                <p>Arbres plantés</p>
              </div>
            </div>
            <div className="welcome-stat">
              <div className="welcome-stat-icon">
                <Target size={24} />
              </div>
              <div className="welcome-stat-info">
                <h3>{FAKE_USER.streak} jours</h3>
                <p>Série active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Cours Terminés</span>
            <div className="metric-icon">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="metric-value">{FAKE_USER.coursesCompleted}</div>
          <div className="metric-label">Sur 340+ disponibles</div>
          <div className="metric-trend">
            <TrendingUp size={16} />
            +3 ce mois
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">CO₂ Compensé</span>
            <div className="metric-icon">
              <Leaf size={20} />
            </div>
          </div>
          <div className="metric-value">{FAKE_USER.carbonOffset} kg</div>
          <div className="metric-label">Équivalent carbone</div>
          <div className="metric-trend">
            <TrendingUp size={16} />
            +24.3 kg cette semaine
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Niveau</span>
            <div className="metric-icon">
              <Award size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>Expert</div>
          <div className="metric-label">{FAKE_USER.level}</div>
          <div className="metric-trend">
            <TrendingUp size={16} />
            78% vers Maître
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Activité d'apprentissage hebdomadaire</h3>
          <p className="chart-subtitle">Heures d'apprentissage par jour</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={LEARNING_STATS}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="day" stroke="#a8a29e" />
            <YAxis stroke="#a8a29e" />
            <Tooltip 
              contentStyle={{ 
                background: '#ffffff', 
                border: '1px solid #e7e5e4', 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            />
            <Bar dataKey="hours" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="achievements-section">
        <div className="section-header">
          <h3 className="section-title">Vos Réalisations</h3>
        </div>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((achievement, index) => (
            <div key={index} className={`achievement-card ${!achievement.unlocked ? 'locked' : ''}`}>
              <div className="achievement-icon">
                <achievement.icon size={28} />
              </div>
              <div className="achievement-title">{achievement.title}</div>
              <div className="achievement-description">{achievement.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Courses Component
const CoursesView = () => {
  return (
    <div>
      <div className="courses-header">
        <h2 className="courses-title">Mes Cours en Cours</h2>
        <p className="courses-subtitle">Continuez votre parcours d'apprentissage personnalisé</p>
      </div>

      <div className="courses-grid">
        {FAKE_COURSES.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-thumbnail">
              <BookOpen size={80} strokeWidth={1.5} />
            </div>
            <div className="course-content">
              <div className="course-header">
                <span className="course-category">{course.category}</span>
                <h3 className="course-title">{course.title}</h3>
                <div className="course-meta">
                  <div className="course-meta-item">
                    <Clock size={16} />
                    {course.duration}
                  </div>
                  <div className="course-meta-item">
                    <BookOpen size={16} />
                    {course.modules} modules
                  </div>
                  <div className="course-meta-item">
                    <Users size={16} />
                    {course.enrolled} inscrits
                  </div>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progression</span>
                  <span className="progress-value">{course.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                </div>
              </div>

              <div className="course-footer">
                <div className="carbon-badge">
                  <Leaf size={18} />
                  {course.carbonImpact} kg CO₂
                </div>
                <button className="course-action">
                  {course.progress === 100 ? (
                    <>
                      <Check size={18} />
                      Terminé
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      Continuer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="recommended-section">
        <div className="section-header">
          <h3 className="section-title">Recommandations IA pour vous</h3>
        </div>
        <div className="recommended-grid">
          {RECOMMENDED_COURSES.map((course) => (
            <div key={course.id} className="recommended-card">
              <div className="recommended-header">
                <div>
                  <h4 className="recommended-title">{course.title}</h4>
                  <div className="recommended-meta">
                    <span>{course.duration}</span>
                    <span>•</span>
                    <span>{course.students} étudiants</span>
                  </div>
                </div>
                <div className="rating">★ {course.rating}</div>
              </div>
              <span className="level-badge">{course.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Impact Component
const ImpactView = () => {
  return (
    <div>
      <div className="impact-hero">
        <h2>Votre Impact Environnemental</h2>
        <p>Chaque minute d'apprentissage contribue à un avenir plus vert</p>
      </div>

      <div className="impact-grid">
        <div className="impact-card">
          <div className="impact-card-header">
            <div className="impact-icon">
              <TreePine size={28} />
            </div>
            <h3 className="impact-card-title">Arbres Plantés</h3>
          </div>
          <div className="impact-value">{FAKE_USER.treesPlanted}</div>
          <p className="impact-description">
            Vos sessions d'apprentissage ont contribué à la plantation de {FAKE_USER.treesPlanted} arbres,
            aidant à restaurer les écosystèmes forestiers.
          </p>
        </div>

        <div className="impact-card">
          <div className="impact-card-header">
            <div className="impact-icon">
              <Leaf size={28} />
            </div>
            <h3 className="impact-card-title">CO₂ Compensé</h3>
          </div>
          <div className="impact-value">{FAKE_USER.carbonOffset} kg</div>
          <p className="impact-description">
            Équivalent à {Math.round(FAKE_USER.carbonOffset * 2.3)} km parcourus en voiture.
            Votre empreinte carbone d'apprentissage est entièrement compensée.
          </p>
        </div>

        <div className="impact-card">
          <div className="impact-card-header">
            <div className="impact-icon">
              <Brain size={28} />
            </div>
            <h3 className="impact-card-title">Impact Collectif</h3>
          </div>
          <div className="impact-value">15,847</div>
          <p className="impact-description">
            Arbres plantés par toute la communauté EcoLearn AI. Ensemble, nous créons un impact mesurable.
          </p>
        </div>
      </div>

      <div className="chart-section" style={{ marginTop: '2rem' }}>
        <div className="chart-header">
          <h3 className="chart-title">Évolution de votre impact</h3>
          <p className="chart-subtitle">Suivi mensuel de votre compensation carbone</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={CARBON_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="month" stroke="#a8a29e" />
            <YAxis yAxisId="left" stroke="#a8a29e" />
            <YAxis yAxisId="right" orientation="right" stroke="#a8a29e" />
            <Tooltip 
              contentStyle={{ 
                background: '#ffffff', 
                border: '1px solid #e7e5e4', 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="carbon" 
              stroke="#059669" 
              strokeWidth={3}
              dot={{ fill: '#059669', r: 5 }}
              name="CO₂ (kg)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="trees" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              name="Arbres"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section" style={{ marginTop: '2rem' }}>
        <div className="chart-header">
          <h3 className="chart-title">Distribution de l'impact par catégorie</h3>
          <p className="chart-subtitle">Répartition de votre compensation carbone</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={IMPACT_DISTRIBUTION}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {IMPACT_DISTRIBUTION.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default App;
