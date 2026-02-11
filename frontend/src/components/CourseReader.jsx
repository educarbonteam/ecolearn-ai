import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Circle,
  Download,
  Share2,
  Bookmark,
  Play,
  Leaf
} from 'lucide-react';

/**
 * CourseReader - Interface pour afficher le contenu généré par l'IA
 * Affiche le cours avec navigation entre les modules
 */
const CourseReader = ({ course, onClose, onProgressUpdate }) => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState(new Set());
  const [showSidebar, setShowSidebar] = useState(true);

  const currentModule = course.content.modules[currentModuleIndex];
  const progress = (completedModules.size / course.content.modules.length) * 100;

  // Marquer un module comme complété
  const markModuleComplete = () => {
    const newCompleted = new Set(completedModules);
    newCompleted.add(currentModuleIndex);
    setCompletedModules(newCompleted);

    // Mettre à jour la progression sur le backend
    if (onProgressUpdate) {
      const newProgress = (newCompleted.size / course.content.modules.length) * 100;
      onProgressUpdate(newProgress);
    }
  };

  // Navigation
  const goToNextModule = () => {
    if (currentModuleIndex < course.content.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const goToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  // Navigation au clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPreviousModule();
      if (e.key === 'ArrowRight') goToNextModule();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentModuleIndex]);

  return (
    <div className="course-reader">
      {/* Header */}
      <div className="reader-header">
        <button className="btn-icon" onClick={onClose}>
          <ChevronLeft size={20} />
        </button>
        <div className="reader-header-info">
          <h1>{course.title}</h1>
          <div className="reader-meta">
            <span>{course.content.modules.length} modules</span>
            <span>•</span>
            <span>{course.duration}</span>
            <span>•</span>
            <span className="progress-text">{Math.round(progress)}% complété</span>
          </div>
        </div>
        <div className="reader-actions">
          <button className="btn-icon" title="Télécharger">
            <Download size={20} />
          </button>
          <button className="btn-icon" title="Partager">
            <Share2 size={20} />
          </button>
          <button className="btn-icon" title="Marquer">
            <Bookmark size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="reader-progress-bar">
        <div className="reader-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="reader-container">
        {/* Sidebar - Table des matières */}
        <aside className={`reader-sidebar ${showSidebar ? 'open' : 'closed'}`}>
          <button 
            className="sidebar-toggle"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? '←' : '→'}
          </button>

          {showSidebar && (
            <div className="sidebar-content">
              <h3>Table des Matières</h3>
              <nav className="modules-nav">
                {course.content.modules.map((module, index) => (
                  <button
                    key={index}
                    className={`module-nav-item ${
                      index === currentModuleIndex ? 'active' : ''
                    } ${completedModules.has(index) ? 'completed' : ''}`}
                    onClick={() => setCurrentModuleIndex(index)}
                  >
                    <div className="module-nav-icon">
                      {completedModules.has(index) ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </div>
                    <div className="module-nav-info">
                      <div className="module-nav-number">Module {index + 1}</div>
                      <div className="module-nav-title">{module.title}</div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Course Objectives */}
              <div className="sidebar-section">
                <h4>Objectifs du cours</h4>
                <ul className="objectives-list">
                  {course.content.objectives.map((obj, idx) => (
                    <li key={idx}>
                      <Leaf size={14} />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="reader-main">
          {/* Module Header */}
          <div className="module-header">
            <div className="module-number">Module {currentModuleIndex + 1} / {course.content.modules.length}</div>
            <h2 className="module-title">{currentModule.title}</h2>
            <div className="module-meta">
              <span className="module-duration">
                <Clock size={16} />
                {currentModule.duration}
              </span>
            </div>
          </div>

          {/* Module Content */}
          <div className="module-content">
            {/* Description */}
            {currentModule.description && (
              <div className="module-section description-section">
                <p className="module-description">{currentModule.description}</p>
              </div>
            )}

            {/* Topics */}
            {currentModule.topics && currentModule.topics.length > 0 && (
              <div className="module-section">
                <h3>Points Clés</h3>
                <div className="topics-grid">
                  {currentModule.topics.map((topic, idx) => (
                    <div key={idx} className="topic-card">
                      <div className="topic-number">{idx + 1}</div>
                      <div className="topic-text">{topic}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Sections */}
            {currentModule.content && (
              <div className="module-section">
                <div className="content-text">
                  {/* Si le contenu est une string, l'afficher */}
                  {typeof currentModule.content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: currentModule.content.replace(/\n/g, '<br/>') }} />
                  ) : (
                    /* Si c'est un objet avec des sections */
                    Object.entries(currentModule.content).map(([key, value], idx) => (
                      <div key={idx} className="content-section">
                        <h4>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                        <p>{value}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Examples */}
            {currentModule.examples && currentModule.examples.length > 0 && (
              <div className="module-section">
                <h3>Exemples Pratiques</h3>
                {currentModule.examples.map((example, idx) => (
                  <div key={idx} className="example-card">
                    <div className="example-header">
                      <Play size={16} />
                      <span>Exemple {idx + 1}</span>
                    </div>
                    <div className="example-content">
                      {typeof example === 'string' ? example : JSON.stringify(example, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exercises */}
            {currentModule.exercises && currentModule.exercises.length > 0 && (
              <div className="module-section">
                <h3>Exercices</h3>
                <div className="exercises-list">
                  {currentModule.exercises.map((exercise, idx) => (
                    <div key={idx} className="exercise-item">
                      <div className="exercise-number">Exercice {idx + 1}</div>
                      <div className="exercise-text">{exercise}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {currentModule.resources && currentModule.resources.length > 0 && (
              <div className="module-section">
                <h3>Ressources Additionnelles</h3>
                <ul className="resources-list">
                  {currentModule.resources.map((resource, idx) => (
                    <li key={idx}>
                      <a href={resource.url || '#'} target="_blank" rel="noopener noreferrer">
                        {resource.title || resource}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Module Footer - Navigation */}
          <div className="module-footer">
            <button
              className="btn-secondary"
              onClick={goToPreviousModule}
              disabled={currentModuleIndex === 0}
            >
              <ChevronLeft size={20} />
              Module Précédent
            </button>

            <button
              className="btn-primary"
              onClick={() => {
                markModuleComplete();
                if (currentModuleIndex < course.content.modules.length - 1) {
                  goToNextModule();
                }
              }}
            >
              {completedModules.has(currentModuleIndex) ? (
                <>
                  <CheckCircle size={20} />
                  Module Complété
                </>
              ) : (
                <>
                  Marquer comme complété
                  <ChevronRight size={20} />
                </>
              )}
            </button>

            {currentModuleIndex === course.content.modules.length - 1 && (
              <button
                className="btn-success"
                onClick={() => {
                  markModuleComplete();
                  alert('🎉 Félicitations ! Vous avez complété le cours !');
                  if (onClose) onClose();
                }}
              >
                <CheckCircle size={20} />
                Terminer le Cours
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Styles */}
      <style jsx>{`
        .course-reader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #fafaf9;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .reader-header {
          background: white;
          border-bottom: 1px solid #e7e5e4;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .reader-header-info {
          flex: 1;
        }

        .reader-header-info h1 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .reader-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #78716c;
        }

        .progress-text {
          color: #059669;
          font-weight: 600;
        }

        .reader-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #57534e;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f5f5f4;
        }

        /* Progress Bar */
        .reader-progress-bar {
          height: 4px;
          background: #e7e5e4;
        }

        .reader-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #059669 0%, #10b981 100%);
          transition: width 0.3s ease;
        }

        /* Container */
        .reader-container {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Sidebar */
        .reader-sidebar {
          width: 320px;
          background: white;
          border-right: 1px solid #e7e5e4;
          overflow-y: auto;
          transition: transform 0.3s ease;
          position: relative;
        }

        .reader-sidebar.closed {
          transform: translateX(-100%);
          width: 0;
        }

        .sidebar-toggle {
          position: absolute;
          right: -40px;
          top: 20px;
          background: white;
          border: 1px solid #e7e5e4;
          border-radius: 0 8px 8px 0;
          padding: 0.5rem;
          cursor: pointer;
          z-index: 10;
        }

        .sidebar-content {
          padding: 2rem;
        }

        .sidebar-content h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .modules-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .module-nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #fafaf9;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .module-nav-item:hover {
          background: #f5f5f4;
        }

        .module-nav-item.active {
          background: rgba(5, 150, 105, 0.1);
          border-color: #059669;
        }

        .module-nav-item.completed {
          opacity: 0.7;
        }

        .module-nav-item.completed .module-nav-icon {
          color: #059669;
        }

        .module-nav-number {
          font-size: 0.75rem;
          color: #78716c;
          font-weight: 600;
          text-transform: uppercase;
        }

        .module-nav-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1c1917;
        }

        .sidebar-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e7e5e4;
        }

        .sidebar-section h4 {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #78716c;
          margin-bottom: 1rem;
        }

        .objectives-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .objectives-list li {
          display: flex;
          align-items: start;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #57534e;
        }

        .objectives-list li svg {
          flex-shrink: 0;
          margin-top: 0.25rem;
          color: #059669;
        }

        /* Main Content */
        .reader-main {
          flex: 1;
          overflow-y: auto;
          padding: 3rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .module-header {
          margin-bottom: 3rem;
        }

        .module-number {
          font-size: 0.875rem;
          font-weight: 600;
          color: #059669;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .module-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #1c1917;
        }

        .module-meta {
          display: flex;
          gap: 1.5rem;
        }

        .module-duration {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #78716c;
          font-size: 0.9375rem;
        }

        /* Content */
        .module-content {
          line-height: 1.8;
          color: #292524;
        }

        .module-section {
          margin-bottom: 3rem;
        }

        .module-section h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #1c1917;
        }

        .module-description {
          font-size: 1.125rem;
          color: #57534e;
          line-height: 1.8;
        }

        .description-section {
          padding: 2rem;
          background: rgba(5, 150, 105, 0.05);
          border-left: 4px solid #059669;
          border-radius: 8px;
        }

        .topics-grid {
          display: grid;
          gap: 1rem;
        }

        .topic-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border: 1px solid #e7e5e4;
          border-radius: 12px;
        }

        .topic-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .topic-text {
          flex: 1;
          font-weight: 500;
        }

        .content-text {
          font-size: 1.0625rem;
          line-height: 1.8;
        }

        .content-section {
          margin-bottom: 2rem;
        }

        .content-section h4 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1c1917;
        }

        .example-card {
          margin-bottom: 1.5rem;
          background: #fafaf9;
          border: 1px solid #e7e5e4;
          border-radius: 12px;
          overflow: hidden;
        }

        .example-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e7e5e4;
          font-weight: 600;
          color: #059669;
        }

        .example-content {
          padding: 1.5rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9375rem;
          white-space: pre-wrap;
        }

        .exercises-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .exercise-item {
          padding: 1.5rem;
          background: white;
          border: 2px solid #e7e5e4;
          border-radius: 12px;
        }

        .exercise-number {
          font-size: 0.875rem;
          font-weight: 700;
          color: #059669;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .exercise-text {
          font-size: 1rem;
          line-height: 1.6;
        }

        .resources-list {
          list-style: none;
          padding: 0;
        }

        .resources-list li {
          padding: 1rem;
          margin-bottom: 0.5rem;
          background: white;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
        }

        .resources-list a {
          color: #059669;
          text-decoration: none;
          font-weight: 500;
        }

        .resources-list a:hover {
          text-decoration: underline;
        }

        /* Footer */
        .module-footer {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid #e7e5e4;
        }

        .btn-primary, .btn-secondary, .btn-success {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .btn-secondary {
          background: white;
          color: #57534e;
          border: 1px solid #e7e5e4;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #fafaf9;
        }

        .btn-success {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          color: white;
        }

        .btn-primary:disabled, .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .reader-sidebar {
            position: absolute;
            height: 100%;
            z-index: 10;
          }

          .reader-main {
            padding: 1.5rem;
          }

          .module-title {
            font-size: 1.75rem;
          }

          .module-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseReader;
