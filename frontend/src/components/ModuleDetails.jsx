import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  BookOpen, 
  CheckCircle,
  PlayCircle,
  FileText,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';

/**
 * ModuleDetails - Affiche les détails complets d'un module
 * Peut être utilisé en modal ou en vue séparée
 */
const ModuleDetails = ({ 
  module, 
  moduleNumber, 
  totalModules, 
  isCompleted,
  onClose,
  onMarkComplete,
  onStartModule
}) => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    content: true,
    examples: true,
    exercises: false,
    resources: false,
    prerequisites: false,
    learningOutcomes: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="module-details-overlay">
      <div className="module-details-container">
        {/* Header */}
        <div className="module-details-header">
          <div className="module-details-header-content">
            <div className="module-badge">
              {isCompleted ? (
                <CheckCircle size={24} className="completed-icon" />
              ) : (
                <div className="module-number-badge">
                  {moduleNumber}
                </div>
              )}
            </div>
            <div className="module-details-title-section">
              <div className="module-meta-line">
                <span className="module-position">
                  Module {moduleNumber} sur {totalModules}
                </span>
                <span className="separator">•</span>
                <span className="module-duration">
                  <Clock size={14} />
                  {module.duration}
                </span>
              </div>
              <h1 className="module-details-title">{module.title}</h1>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="module-details-content">
          {/* Overview Section */}
          <Section
            title="Vue d'Ensemble"
            icon={<BookOpen size={20} />}
            isExpanded={expandedSections.overview}
            onToggle={() => toggleSection('overview')}
          >
            <div className="overview-section">
              <p className="module-description">{module.description}</p>
              
              {module.difficulty && (
                <div className="info-badge difficulty">
                  <span className="badge-label">Niveau</span>
                  <span className="badge-value">{module.difficulty}</span>
                </div>
              )}

              {module.estimatedTime && (
                <div className="info-badge">
                  <Clock size={16} />
                  <span>Temps estimé : {module.estimatedTime}</span>
                </div>
              )}

              {module.completionCriteria && (
                <div className="completion-criteria">
                  <h4>Pour compléter ce module :</h4>
                  <ul>
                    {module.completionCriteria.map((criteria, idx) => (
                      <li key={idx}>
                        <CheckCircle size={16} />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>

          {/* Learning Outcomes */}
          {module.learningOutcomes && module.learningOutcomes.length > 0 && (
            <Section
              title="Objectifs d'Apprentissage"
              icon={<Target size={20} />}
              isExpanded={expandedSections.learningOutcomes}
              onToggle={() => toggleSection('learningOutcomes')}
            >
              <div className="learning-outcomes">
                <p className="section-intro">À la fin de ce module, vous serez capable de :</p>
                <ul className="outcomes-list">
                  {module.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="outcome-item">
                      <div className="outcome-number">{idx + 1}</div>
                      <div className="outcome-text">{outcome}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          )}

          {/* Prerequisites */}
          {module.prerequisites && module.prerequisites.length > 0 && (
            <Section
              title="Prérequis"
              icon={<AlertCircle size={20} />}
              isExpanded={expandedSections.prerequisites}
              onToggle={() => toggleSection('prerequisites')}
            >
              <div className="prerequisites">
                <p className="section-intro">Avant de commencer ce module, assurez-vous de maîtriser :</p>
                <div className="prerequisites-grid">
                  {module.prerequisites.map((prereq, idx) => (
                    <div key={idx} className="prerequisite-card">
                      <CheckCircle size={16} />
                      <span>{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Main Topics */}
          {module.topics && module.topics.length > 0 && (
            <Section
              title="Points Clés Abordés"
              icon={<Lightbulb size={20} />}
              isExpanded={expandedSections.content}
              onToggle={() => toggleSection('content')}
            >
              <div className="topics-detailed">
                {module.topics.map((topic, idx) => (
                  <div key={idx} className="topic-detailed-card">
                    <div className="topic-header">
                      <div className="topic-number">{idx + 1}</div>
                      <h4>{typeof topic === 'object' ? topic.title : topic}</h4>
                    </div>
                    {typeof topic === 'object' && topic.description && (
                      <p className="topic-description">{topic.description}</p>
                    )}
                    {typeof topic === 'object' && topic.subtopics && (
                      <ul className="subtopics-list">
                        {topic.subtopics.map((subtopic, subIdx) => (
                          <li key={subIdx}>{subtopic}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Content Sections */}
          {module.sections && module.sections.length > 0 && (
            <Section
              title="Contenu du Module"
              icon={<FileText size={20} />}
              isExpanded={expandedSections.content}
              onToggle={() => toggleSection('content')}
            >
              <div className="content-sections">
                {module.sections.map((section, idx) => (
                  <div key={idx} className="content-section-card">
                    <h4 className="section-title">
                      <span className="section-number">{idx + 1}.</span>
                      {section.title}
                    </h4>
                    {section.duration && (
                      <div className="section-meta">
                        <Clock size={14} />
                        <span>{section.duration}</span>
                      </div>
                    )}
                    <p className="section-description">{section.description}</p>
                    {section.keyPoints && (
                      <ul className="section-key-points">
                        {section.keyPoints.map((point, pIdx) => (
                          <li key={pIdx}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Examples */}
          {module.examples && module.examples.length > 0 && (
            <Section
              title="Exemples Pratiques"
              icon={<PlayCircle size={20} />}
              isExpanded={expandedSections.examples}
              onToggle={() => toggleSection('examples')}
              count={module.examples.length}
            >
              <div className="examples-detailed">
                {module.examples.map((example, idx) => (
                  <div key={idx} className="example-detailed-card">
                    <div className="example-header">
                      <PlayCircle size={18} />
                      <h4>Exemple {idx + 1}</h4>
                    </div>
                    <div className="example-content">
                      {typeof example === 'object' ? (
                        <>
                          {example.title && <h5>{example.title}</h5>}
                          {example.description && <p>{example.description}</p>}
                          {example.code && (
                            <pre className="code-block">
                              <code>{example.code}</code>
                            </pre>
                          )}
                          {example.explanation && (
                            <div className="explanation">
                              <strong>Explication :</strong>
                              <p>{example.explanation}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p>{example}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Exercises */}
          {module.exercises && module.exercises.length > 0 && (
            <Section
              title="Exercices Pratiques"
              icon={<Award size={20} />}
              isExpanded={expandedSections.exercises}
              onToggle={() => toggleSection('exercises')}
              count={module.exercises.length}
            >
              <div className="exercises-detailed">
                {module.exercises.map((exercise, idx) => (
                  <div key={idx} className="exercise-detailed-card">
                    <div className="exercise-header">
                      <div className="exercise-badge">
                        Exercice {idx + 1}
                      </div>
                      {exercise.difficulty && (
                        <span className={`difficulty-badge ${exercise.difficulty}`}>
                          {exercise.difficulty}
                        </span>
                      )}
                      {exercise.estimatedTime && (
                        <span className="time-badge">
                          <Clock size={14} />
                          {exercise.estimatedTime}
                        </span>
                      )}
                    </div>
                    <div className="exercise-content">
                      {typeof exercise === 'object' ? (
                        <>
                          {exercise.title && <h5>{exercise.title}</h5>}
                          <p className="exercise-instruction">{exercise.instruction || exercise.description}</p>
                          {exercise.steps && (
                            <div className="exercise-steps">
                              <strong>Étapes :</strong>
                              <ol>
                                {exercise.steps.map((step, sIdx) => (
                                  <li key={sIdx}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {exercise.hints && (
                            <details className="exercise-hints">
                              <summary>💡 Indices</summary>
                              <ul>
                                {exercise.hints.map((hint, hIdx) => (
                                  <li key={hIdx}>{hint}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                          {exercise.solution && (
                            <details className="exercise-solution">
                              <summary>✅ Solution</summary>
                              <div className="solution-content">
                                {exercise.solution}
                              </div>
                            </details>
                          )}
                        </>
                      ) : (
                        <p className="exercise-instruction">{exercise}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Resources */}
          {module.resources && module.resources.length > 0 && (
            <Section
              title="Ressources Complémentaires"
              icon={<LinkIcon size={20} />}
              isExpanded={expandedSections.resources}
              onToggle={() => toggleSection('resources')}
              count={module.resources.length}
            >
              <div className="resources-detailed">
                {module.resources.map((resource, idx) => (
                  <div key={idx} className="resource-detailed-card">
                    {typeof resource === 'object' ? (
                      <>
                        <div className="resource-header">
                          <LinkIcon size={16} />
                          <h5>{resource.title}</h5>
                          {resource.type && (
                            <span className="resource-type">{resource.type}</span>
                          )}
                        </div>
                        {resource.description && (
                          <p className="resource-description">{resource.description}</p>
                        )}
                        {resource.url && (
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="resource-link"
                          >
                            Accéder à la ressource →
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="resource-simple">
                        <LinkIcon size={16} />
                        <span>{resource}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Summary */}
          {module.summary && (
            <Section
              title="Résumé du Module"
              icon={<FileText size={20} />}
              isExpanded={true}
              onToggle={() => {}}
            >
              <div className="module-summary">
                <p>{module.summary}</p>
              </div>
            </Section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="module-details-footer">
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Fermer
          </button>
          
          {!isCompleted && onStartModule && (
            <button 
              className="btn-primary"
              onClick={onStartModule}
            >
              <PlayCircle size={20} />
              Commencer le Module
            </button>
          )}
          
          {isCompleted && (
            <div className="completed-badge-footer">
              <CheckCircle size={20} />
              Module Complété
            </div>
          )}
          
          {!isCompleted && onMarkComplete && (
            <button 
              className="btn-success"
              onClick={onMarkComplete}
            >
              <CheckCircle size={20} />
              Marquer comme Complété
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Section - Composant pour afficher une section repliable
 */
const Section = ({ title, icon, isExpanded, onToggle, count, children }) => {
  return (
    <div className={`details-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="section-header" onClick={onToggle}>
        <div className="section-header-left">
          <span className="section-icon">{icon}</span>
          <h3 className="section-title">{title}</h3>
          {count && <span className="section-count">({count})</span>}
        </div>
        <div className="section-header-right">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default ModuleDetails;
