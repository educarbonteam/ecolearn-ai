import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Edit,
  Copy
} from 'lucide-react';

/**
 * ModuleEditor - Formulaire pour créer ou éditer les détails d'un module
 * Permet d'ajouter toutes les informations détaillées
 */
const ModuleEditor = ({ 
  module = null, 
  courseId = null,
  onSave, 
  onCancel,
  isEditing = false 
}) => {
  // État principal du formulaire
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    difficulty: 'intermediate',
    description: '',
    estimatedTime: '',
    completionCriteria: [],
    learningOutcomes: [],
    prerequisites: [],
    topics: [],
    sections: [],
    examples: [],
    exercises: [],
    resources: [],
    summary: ''
  });

  // États UI
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    outcomes: false,
    prerequisites: false,
    topics: false,
    sections: false,
    examples: false,
    exercises: false,
    resources: false,
    summary: false
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Charger les données du module en édition
  useEffect(() => {
    if (module && isEditing) {
      setFormData({
        title: module.title || '',
        duration: module.duration || '',
        difficulty: module.difficulty || 'intermediate',
        description: module.description || '',
        estimatedTime: module.estimatedTime || '',
        completionCriteria: module.completionCriteria || [],
        learningOutcomes: module.learningOutcomes || [],
        prerequisites: module.prerequisites || [],
        topics: module.topics || [],
        sections: module.sections || [],
        examples: module.examples || [],
        exercises: module.exercises || [],
        resources: module.resources || [],
        summary: module.summary || ''
      });
    }
  }, [module, isEditing]);

  // Gestion des champs simples
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Gestion des listes (tableaux de strings)
  const addListItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateListItem = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Gestion des topics (objets)
  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, { title: '', description: '', subtopics: [] }]
    }));
  };

  const updateTopic = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => 
        i === index ? { ...topic, [field]: value } : topic
      )
    }));
  };

  const addSubtopic = (topicIndex) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => 
        i === topicIndex 
          ? { ...topic, subtopics: [...topic.subtopics, ''] }
          : topic
      )
    }));
  };

  const updateSubtopic = (topicIndex, subtopicIndex, value) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => 
        i === topicIndex 
          ? {
              ...topic,
              subtopics: topic.subtopics.map((sub, j) => 
                j === subtopicIndex ? value : sub
              )
            }
          : topic
      )
    }));
  };

  const removeTopic = (index) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  // Gestion des sections
  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { 
        title: '', 
        duration: '', 
        description: '', 
        keyPoints: [] 
      }]
    }));
  };

  const updateSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const addKeyPoint = (sectionIndex) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { ...section, keyPoints: [...section.keyPoints, ''] }
          : section
      )
    }));
  };

  const updateKeyPoint = (sectionIndex, keyPointIndex, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? {
              ...section,
              keyPoints: section.keyPoints.map((kp, j) => 
                j === keyPointIndex ? value : kp
              )
            }
          : section
      )
    }));
  };

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  // Gestion des exemples
  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { 
        title: '', 
        description: '', 
        code: '', 
        explanation: '' 
      }]
    }));
  };

  const updateExample = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((example, i) => 
        i === index ? { ...example, [field]: value } : example
      )
    }));
  };

  const removeExample = (index) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  // Gestion des exercices
  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        title: '',
        difficulty: 'medium',
        estimatedTime: '',
        instruction: '',
        steps: [],
        hints: [],
        solution: ''
      }]
    }));
  };

  const updateExercise = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const addExerciseStep = (exerciseIndex) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? { ...exercise, steps: [...exercise.steps, ''] }
          : exercise
      )
    }));
  };

  const updateExerciseStep = (exerciseIndex, stepIndex, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? {
              ...exercise,
              steps: exercise.steps.map((step, j) => 
                j === stepIndex ? value : step
              )
            }
          : exercise
      )
    }));
  };

  const addExerciseHint = (exerciseIndex) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? { ...exercise, hints: [...exercise.hints, ''] }
          : exercise
      )
    }));
  };

  const updateExerciseHint = (exerciseIndex, hintIndex, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? {
              ...exercise,
              hints: exercise.hints.map((hint, j) => 
                j === hintIndex ? value : hint
              )
            }
          : exercise
      )
    }));
  };

  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  // Gestion des ressources
  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, {
        title: '',
        type: 'documentation',
        description: '',
        url: ''
      }]
    }));
  };

  const updateResource = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((resource, i) => 
        i === index ? { ...resource, [field]: value } : resource
      )
    }));
  };

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  // Toggle sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'La durée est requise';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sauvegarde
  const handleSave = async () => {
    if (!validate()) {
      alert('❌ Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }

    setIsSaving(true);

    try {
      // Nettoyer les données (retirer les éléments vides)
      const cleanedData = {
        ...formData,
        completionCriteria: formData.completionCriteria.filter(c => c.trim()),
        learningOutcomes: formData.learningOutcomes.filter(o => o.trim()),
        prerequisites: formData.prerequisites.filter(p => p.trim()),
        topics: formData.topics.filter(t => t.title.trim()),
        sections: formData.sections.filter(s => s.title.trim()),
        examples: formData.examples.filter(e => e.title.trim() || e.description.trim()),
        exercises: formData.exercises.filter(e => e.title.trim() || e.instruction.trim()),
        resources: formData.resources.filter(r => r.title.trim())
      };

      // Appeler le callback de sauvegarde
      if (onSave) {
        await onSave(cleanedData);
      }

      alert('✅ Module sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="module-editor-overlay">
      <div className="module-editor-container">
        {/* Header */}
        <div className="module-editor-header">
          <div className="module-editor-title-section">
            <Edit size={24} />
            <h1>
              {isEditing ? 'Éditer le Module' : 'Nouveau Module'}
            </h1>
          </div>
          <div className="module-editor-actions">
            <button 
              className="btn-secondary"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Éditer' : 'Prévisualiser'}
            </button>
            <button className="btn-close" onClick={onCancel}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="module-editor-content">
          {/* Section: Informations de Base */}
          <EditorSection
            title="Informations de Base"
            isExpanded={expandedSections.basic}
            onToggle={() => toggleSection('basic')}
            isRequired={true}
          >
            <div className="form-grid">
              <div className="form-group full-width">
                <label>
                  Titre du Module *
                  {errors.title && <span className="error-text">{errors.title}</span>}
                </label>
                <input
                  type="text"
                  className={errors.title ? 'error' : ''}
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ex: Introduction au Machine Learning"
                />
              </div>

              <div className="form-group">
                <label>
                  Durée *
                  {errors.duration && <span className="error-text">{errors.duration}</span>}
                </label>
                <input
                  type="text"
                  className={errors.duration ? 'error' : ''}
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="Ex: 2h30"
                />
              </div>

              <div className="form-group">
                <label>Niveau de Difficulté</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>

              <div className="form-group">
                <label>Temps Estimé (total)</label>
                <input
                  type="text"
                  value={formData.estimatedTime}
                  onChange={(e) => handleChange('estimatedTime', e.target.value)}
                  placeholder="Ex: 4h + 2h d'exercices"
                />
              </div>

              <div className="form-group full-width">
                <label>
                  Description *
                  {errors.description && <span className="error-text">{errors.description}</span>}
                </label>
                <textarea
                  className={errors.description ? 'error' : ''}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Description générale du module..."
                  rows={4}
                />
              </div>
            </div>
          </EditorSection>

          {/* Section: Critères de Complétion */}
          <EditorSection
            title="Critères de Complétion"
            isExpanded={expandedSections.outcomes}
            onToggle={() => toggleSection('outcomes')}
          >
            <ListEditor
              items={formData.completionCriteria}
              onAdd={() => addListItem('completionCriteria')}
              onUpdate={(index, value) => updateListItem('completionCriteria', index, value)}
              onRemove={(index) => removeListItem('completionCriteria', index)}
              placeholder="Ex: Terminer tous les exercices"
              label="Critère"
            />
          </EditorSection>

          {/* Section: Objectifs d'Apprentissage */}
          <EditorSection
            title="Objectifs d'Apprentissage"
            isExpanded={expandedSections.outcomes}
            onToggle={() => toggleSection('outcomes')}
          >
            <ListEditor
              items={formData.learningOutcomes}
              onAdd={() => addListItem('learningOutcomes')}
              onUpdate={(index, value) => updateListItem('learningOutcomes', index, value)}
              onRemove={(index) => removeListItem('learningOutcomes', index)}
              placeholder="Ex: Comprendre les concepts fondamentaux du ML"
              label="Objectif"
            />
          </EditorSection>

          {/* Section: Prérequis */}
          <EditorSection
            title="Prérequis"
            isExpanded={expandedSections.prerequisites}
            onToggle={() => toggleSection('prerequisites')}
          >
            <ListEditor
              items={formData.prerequisites}
              onAdd={() => addListItem('prerequisites')}
              onUpdate={(index, value) => updateListItem('prerequisites', index, value)}
              onRemove={(index) => removeListItem('prerequisites', index)}
              placeholder="Ex: Bases en Python"
              label="Prérequis"
            />
          </EditorSection>

          {/* Section: Points Clés (Topics) */}
          <EditorSection
            title="Points Clés Abordés"
            isExpanded={expandedSections.topics}
            onToggle={() => toggleSection('topics')}
          >
            <TopicsEditor
              topics={formData.topics}
              onAdd={addTopic}
              onUpdate={updateTopic}
              onRemove={removeTopic}
              onAddSubtopic={addSubtopic}
              onUpdateSubtopic={updateSubtopic}
            />
          </EditorSection>

          {/* Section: Sections de Contenu */}
          <EditorSection
            title="Sections de Contenu"
            isExpanded={expandedSections.sections}
            onToggle={() => toggleSection('sections')}
          >
            <SectionsEditor
              sections={formData.sections}
              onAdd={addSection}
              onUpdate={updateSection}
              onRemove={removeSection}
              onAddKeyPoint={addKeyPoint}
              onUpdateKeyPoint={updateKeyPoint}
            />
          </EditorSection>

          {/* Section: Exemples */}
          <EditorSection
            title="Exemples Pratiques"
            isExpanded={expandedSections.examples}
            onToggle={() => toggleSection('examples')}
          >
            <ExamplesEditor
              examples={formData.examples}
              onAdd={addExample}
              onUpdate={updateExample}
              onRemove={removeExample}
            />
          </EditorSection>

          {/* Section: Exercices */}
          <EditorSection
            title="Exercices"
            isExpanded={expandedSections.exercises}
            onToggle={() => toggleSection('exercises')}
          >
            <ExercisesEditor
              exercises={formData.exercises}
              onAdd={addExercise}
              onUpdate={updateExercise}
              onRemove={removeExercise}
              onAddStep={addExerciseStep}
              onUpdateStep={updateExerciseStep}
              onAddHint={addExerciseHint}
              onUpdateHint={updateExerciseHint}
            />
          </EditorSection>

          {/* Section: Ressources */}
          <EditorSection
            title="Ressources Complémentaires"
            isExpanded={expandedSections.resources}
            onToggle={() => toggleSection('resources')}
          >
            <ResourcesEditor
              resources={formData.resources}
              onAdd={addResource}
              onUpdate={updateResource}
              onRemove={removeResource}
            />
          </EditorSection>

          {/* Section: Résumé */}
          <EditorSection
            title="Résumé du Module"
            isExpanded={expandedSections.summary}
            onToggle={() => toggleSection('summary')}
          >
            <div className="form-group full-width">
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Résumé général de ce que l'étudiant aura appris..."
                rows={5}
              />
            </div>
          </EditorSection>
        </div>

        {/* Footer */}
        <div className="module-editor-footer">
          <button 
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Annuler
          </button>
          
          <button 
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>⏳ Sauvegarde...</>
            ) : (
              <>
                <Save size={20} />
                {isEditing ? 'Mettre à Jour' : 'Créer le Module'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composants auxiliaires
const EditorSection = ({ title, children, isExpanded, onToggle, isRequired = false }) => (
  <div className="editor-section">
    <button className="editor-section-header" onClick={onToggle}>
      <span className="editor-section-title">
        {title}
        {isRequired && <span className="required-badge">Requis</span>}
      </span>
      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
    {isExpanded && (
      <div className="editor-section-content">
        {children}
      </div>
    )}
  </div>
);

const ListEditor = ({ items, onAdd, onUpdate, onRemove, placeholder, label }) => (
  <div className="list-editor">
    {items.map((item, index) => (
      <div key={index} className="list-item">
        <input
          type="text"
          value={item}
          onChange={(e) => onUpdate(index, e.target.value)}
          placeholder={placeholder}
        />
        <button 
          className="btn-icon-danger"
          onClick={() => onRemove(index)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ))}
    <button className="btn-add" onClick={onAdd}>
      <Plus size={18} />
      Ajouter un {label}
    </button>
  </div>
);

const TopicsEditor = ({ topics, onAdd, onUpdate, onRemove, onAddSubtopic, onUpdateSubtopic }) => (
  <div className="topics-editor">
    {topics.map((topic, index) => (
      <div key={index} className="topic-editor-card">
        <div className="topic-editor-header">
          <span>Point Clé #{index + 1}</span>
          <button 
            className="btn-icon-danger"
            onClick={() => onRemove(index)}
          >
            <Trash2 size={18} />
          </button>
        </div>
        <div className="form-group">
          <label>Titre</label>
          <input
            type="text"
            value={topic.title}
            onChange={(e) => onUpdate(index, 'title', e.target.value)}
            placeholder="Titre du point clé"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={topic.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            placeholder="Description détaillée..."
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Sous-points</label>
          {topic.subtopics.map((subtopic, subIndex) => (
            <div key={subIndex} className="list-item">
              <input
                type="text"
                value={subtopic}
                onChange={(e) => onUpdateSubtopic(index, subIndex, e.target.value)}
                placeholder="Sous-point"
              />
            </div>
          ))}
          <button 
            className="btn-add-small"
            onClick={() => onAddSubtopic(index)}
          >
            <Plus size={16} />
            Ajouter un sous-point
          </button>
        </div>
      </div>
    ))}
    <button className="btn-add" onClick={onAdd}>
      <Plus size={18} />
      Ajouter un Point Clé
    </button>
  </div>
);

// Autres éditeurs similaires (SectionsEditor, ExamplesEditor, etc.)
// ... (code similaire, simplifié pour la longueur)

const SectionsEditor = ({ sections, onAdd, onUpdate, onRemove, onAddKeyPoint, onUpdateKeyPoint }) => (
  <div className="sections-editor">
    {sections.map((section, index) => (
      <div key={index} className="section-editor-card">
        <div className="section-editor-header">
          <span>Section #{index + 1}</span>
          <button onClick={() => onRemove(index)} className="btn-icon-danger">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={section.title}
              onChange={(e) => onUpdate(index, 'title', e.target.value)}
              placeholder="Titre de la section"
            />
          </div>
          <div className="form-group">
            <label>Durée</label>
            <input
              type="text"
              value={section.duration}
              onChange={(e) => onUpdate(index, 'duration', e.target.value)}
              placeholder="Ex: 30min"
            />
          </div>
          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              value={section.description}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              placeholder="Description de la section..."
              rows={3}
            />
          </div>
        </div>
      </div>
    ))}
    <button className="btn-add" onClick={onAdd}>
      <Plus size={18} />
      Ajouter une Section
    </button>
  </div>
);

const ExamplesEditor = ({ examples, onAdd, onUpdate, onRemove }) => (
  <div className="examples-editor">
    {examples.map((example, index) => (
      <div key={index} className="example-editor-card">
        <div className="example-editor-header">
          <span>Exemple #{index + 1}</span>
          <button onClick={() => onRemove(index)} className="btn-icon-danger">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="form-group">
          <label>Titre</label>
          <input
            type="text"
            value={example.title}
            onChange={(e) => onUpdate(index, 'title', e.target.value)}
            placeholder="Titre de l'exemple"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={example.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            placeholder="Description..."
            rows={2}
          />
        </div>
        <div className="form-group">
          <label>Code</label>
          <textarea
            value={example.code}
            onChange={(e) => onUpdate(index, 'code', e.target.value)}
            placeholder="Code de l'exemple..."
            rows={8}
            className="code-editor"
          />
        </div>
        <div className="form-group">
          <label>Explication</label>
          <textarea
            value={example.explanation}
            onChange={(e) => onUpdate(index, 'explanation', e.target.value)}
            placeholder="Explication du code..."
            rows={3}
          />
        </div>
      </div>
    ))}
    <button className="btn-add" onClick={onAdd}>
      <Plus size={18} />
      Ajouter un Exemple
    </button>
  </div>
);

const ExercisesEditor = ({ exercises, onAdd, onUpdate, onRemove, onAddStep, onUpdateStep, onAddHint, onUpdateHint }) => (
  <div className="exercises-editor">
    {exercises.map((exercise, index) => (
      <div key={index} className="exercise-editor-card">
        <div className="exercise-editor-header">
          <span>Exercice #{index + 1}</span>
          <button onClick={() => onRemove(index)} className="btn-icon-danger">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={exercise.title}
              onChange={(e) => onUpdate(index, 'title', e.target.value)}
              placeholder="Titre de l'exercice"
            />
          </div>
          <div className="form-group">
            <label>Difficulté</label>
            <select
              value={exercise.difficulty}
              onChange={(e) => onUpdate(index, 'difficulty', e.target.value)}
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>
          <div className="form-group">
            <label>Temps Estimé</label>
            <input
              type="text"
              value={exercise.estimatedTime}
              onChange={(e) => onUpdate(index, 'estimatedTime', e.target.value)}
              placeholder="Ex: 30min"
            />
          </div>
          <div className="form-group full-width">
            <label>Instructions</label>
            <textarea
              value={exercise.instruction}
              onChange={(e) => onUpdate(index, 'instruction', e.target.value)}
              placeholder="Instructions détaillées..."
              rows={4}
            />
          </div>
          <div className="form-group full-width">
            <label>Solution</label>
            <textarea
              value={exercise.solution}
              onChange={(e) => onUpdate(index, 'solution', e.target.value)}
              placeholder="Solution complète..."
              rows={6}
              className="code-editor"
            />
          </div>
        </div>
      </div>
    ))}
    <button className="btn-add" onClick={onAdd}>
      <Plus size={18} />
      Ajouter un Exercice
    </button>
  </div>
);

const ResourcesEditor = ({ resources, onAdd, onUpdate, onRemove }) => (
  <div className="resources-editor">
    {resources.map((resource, index) => (
      <div key={index} className="resource-editor-card">
        <div className="resource-editor-header">
          <span>Ressource #{index + 1}</span>
          <button onClick={() => onRemove(index)} className="btn-icon-danger">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={resource.title}
              onChange={(e) => onUpdate(index, 'title', e.target.value)}
              placeholder="Titre de la ressource"
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={resource.type}
              onChange={(e) => onUpdate(index, 'type', e.target.value)}
            >
              <option value="documentation">Documentation</option>
              <option value="video">Vidéo</option>
              <option value="article">Article</option>
              <option value="book">Livre</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              value={resource.description}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              placeholder="Description..."
              rows={2}
            />
          </div>
          <div className="form-group full-width">
            <label>URL</label>
            <input
              type="url"
              value={resource.url}
              onChange={(e) => onUpdate(index, 'url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>
    ))}
    <button className="btn-add" onClick={onAdd}>
      <Plus size={18} />
      Ajouter une Ressource
    </button>
  </div>
);

export default ModuleEditor;
