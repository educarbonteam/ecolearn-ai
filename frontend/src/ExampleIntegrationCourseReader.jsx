/**
 * EXEMPLE D'INTÉGRATION du CourseReader dans App.jsx
 * 
 * Ce fichier montre comment intégrer le composant CourseReader
 * pour afficher le contenu généré par l'IA
 */

import React, { useState } from 'react';
import CourseReader from './components/CourseReader';
import { aiService, courseService } from './services/ecolearn';

// ÉTAPE 1 : Ajouter ces imports en haut de votre App.jsx existant

// ÉTAPE 2 : Ajouter ces états dans votre composant App
function AppWithCourseReader() {
  // États existants...
  const [currentView, setCurrentView] = useState('home');
  
  // NOUVEAUX ÉTATS pour le lecteur
  const [showCourseReader, setShowCourseReader] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [generating, setGenerating] = useState(false);

  // ÉTAPE 3 : Fonction pour générer et afficher un cours
  const handleGenerateAndRead = async (formData) => {
    setGenerating(true);
    
    try {
      console.log('🤖 Génération du cours avec l\'IA...');
      
      // Appel à l'API de génération IA
      const result = await aiService.generateCourse({
        topic: formData.topic,
        difficulty: formData.difficulty,
        duration: formData.duration,
        focus_areas: formData.focus_areas || []
      });
      
      console.log('✅ Cours généré:', result);
      
      // Préparer le cours pour le lecteur
      const courseForReader = {
        id: result.course.id,
        title: result.course.title,
        description: result.course.description,
        duration: result.course.duration,
        instructor: result.course.instructor || 'IA EcoLearn',
        content: result.content // Contenu structuré avec modules
      };
      
      // Ouvrir le lecteur
      setSelectedCourse(courseForReader);
      setShowCourseReader(true);
      
      // Optionnel : afficher une notification
      alert('✅ Cours généré avec succès ! Bonne lecture 📖');
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération:', error);
      alert(
        error.response?.data?.detail || 
        'Erreur lors de la génération du cours. Vérifiez votre clé OpenAI.'
      );
    } finally {
      setGenerating(false);
    }
  };

  // ÉTAPE 4 : Fonction pour ouvrir un cours existant
  const handleOpenCourse = async (courseId) => {
    try {
      console.log('📖 Ouverture du cours', courseId);
      
      // Récupérer le cours complet depuis l'API
      const course = await courseService.getCourseById(courseId);
      
      console.log('✅ Cours récupéré:', course);
      
      // Vérifier que le contenu est au bon format
      if (!course.content || !course.content.modules) {
        alert('❌ Le contenu du cours n\'est pas disponible');
        return;
      }
      
      // Préparer pour le lecteur
      setSelectedCourse({
        id: course.id,
        title: course.title,
        description: course.description,
        duration: course.duration,
        instructor: course.instructor,
        content: course.content
      });
      
      // Ouvrir le lecteur
      setShowCourseReader(true);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Impossible d\'ouvrir le cours');
    }
  };

  // ÉTAPE 5 : Fonction pour gérer la progression
  const handleProgressUpdate = async (progress) => {
    console.log('📊 Progression mise à jour:', progress + '%');
    
    // Optionnel : sauvegarder la progression sur le backend
    if (selectedCourse?.enrollmentId) {
      try {
        await courseService.updateProgress(
          selectedCourse.enrollmentId, 
          progress
        );
        console.log('✅ Progression sauvegardée');
      } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
      }
    }
  };

  // ÉTAPE 6 : Fonction pour fermer le lecteur
  const handleCloseCourseReader = () => {
    setShowCourseReader(false);
    setSelectedCourse(null);
    
    // Optionnel : revenir à une vue spécifique
    setCurrentView('courses');
  };

  // ÉTAPE 7 : Dans votre JSX existant, ajouter des boutons pour ouvrir le lecteur

  return (
    <div className="app">
      {/* Votre contenu existant... */}
      
      {/* EXEMPLE 1 : Bouton dans le générateur de cours */}
      {currentView === 'generate' && (
        <div className="generate-course-view">
          <h2>Générer un Cours avec l'IA</h2>
          
          {/* Vos champs de formulaire existants... */}
          
          <button 
            onClick={() => handleGenerateAndRead({
              topic: 'Machine Learning',
              difficulty: 'intermediate',
              duration: '10h'
            })}
            disabled={generating}
          >
            {generating ? (
              <>⏳ Génération en cours...</>
            ) : (
              <>✨ Générer et Lire</>
            )}
          </button>
        </div>
      )}

      {/* EXEMPLE 2 : Bouton dans la liste des cours */}
      {currentView === 'courses' && (
        <div className="courses-view">
          <h2>Catalogue de Cours</h2>
          
          <div className="courses-grid">
            {/* Simuler une liste de cours */}
            <div className="course-card">
              <h3>Introduction au Python</h3>
              <p>Un cours complet pour débutants</p>
              <button onClick={() => handleOpenCourse(1)}>
                📖 Lire le cours
              </button>
            </div>
            
            <div className="course-card">
              <h3>Machine Learning Avancé</h3>
              <p>Techniques avancées de ML</p>
              <button onClick={() => handleOpenCourse(2)}>
                📖 Lire le cours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXEMPLE 3 : Bouton dans "Mes Cours" */}
      {currentView === 'my-courses' && (
        <div className="my-courses-view">
          <h2>Mes Cours en Cours</h2>
          
          <div className="enrollments-list">
            <div className="enrollment-card">
              <h3>Python pour Débutants</h3>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '45%' }} />
              </div>
              <p>45% complété</p>
              <button onClick={() => handleOpenCourse(1)}>
                📖 Continuer la lecture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÉTAPE 8 : Ajouter le CourseReader (À LA FIN, juste avant </div>) */}
      {showCourseReader && selectedCourse && (
        <CourseReader
          course={selectedCourse}
          onClose={handleCloseCourseReader}
          onProgressUpdate={handleProgressUpdate}
        />
      )}
    </div>
  );
}

// ========================================
// EXEMPLE AVEC DONNÉES DE TEST
// ========================================

function TestCourseReader() {
  const [showReader, setShowReader] = useState(false);

  // Données de test pour le lecteur
  const testCourse = {
    title: "Introduction au Machine Learning",
    description: "Découvrez les fondamentaux du Machine Learning et apprenez à créer vos premiers modèles prédictifs",
    duration: "12h",
    instructor: "Dr. Sophie Martin",
    content: {
      objectives: [
        "Comprendre les concepts fondamentaux du Machine Learning",
        "Distinguer les différents types d'apprentissage",
        "Implémenter des algorithmes de base",
        "Évaluer les performances d'un modèle",
        "Appliquer le ML à des cas concrets"
      ],
      modules: [
        {
          title: "Introduction et Vue d'Ensemble",
          duration: "1h30",
          description: "Découvrez ce qu'est le Machine Learning, ses applications et son importance dans le monde moderne.",
          topics: [
            "Définition du Machine Learning",
            "Différence entre IA, ML et Deep Learning",
            "Applications concrètes dans divers secteurs",
            "Prérequis et outils nécessaires"
          ],
          content: `Le Machine Learning (ML) est une branche de l'intelligence artificielle qui permet aux ordinateurs d'apprendre à partir de données sans être explicitement programmés pour chaque tâche spécifique.

Contrairement à la programmation traditionnelle où nous définissons des règles explicites, le Machine Learning permet aux algorithmes de découvrir des patterns dans les données et d'améliorer leurs performances au fil du temps.

Les applications du ML sont omniprésentes dans notre quotidien :
- Recommandations Netflix et Spotify
- Reconnaissance faciale sur smartphones
- Détection de fraudes bancaires
- Traduction automatique (Google Translate)
- Voitures autonomes
- Diagnostics médicaux assistés

Le ML se divise en trois grandes catégories :
1. Apprentissage supervisé : le modèle apprend à partir de données étiquetées
2. Apprentissage non supervisé : le modèle découvre des structures cachées dans les données
3. Apprentissage par renforcement : le modèle apprend par essai-erreur en maximisant une récompense`,
          examples: [
            "Spam Detection : Un algorithme ML analyse des milliers d'emails étiquetés comme 'spam' ou 'non-spam' pour apprendre à distinguer automatiquement les futurs emails malveillants.",
            "Prédiction de Prix : Un modèle ML peut prédire le prix d'une maison en analysant des caractéristiques comme la superficie, le nombre de chambres, la localisation, etc."
          ],
          exercises: [
            "Identifiez 5 applications de Machine Learning que vous utilisez quotidiennement",
            "Classez ces applications en apprentissage supervisé, non supervisé ou par renforcement",
            "Réfléchissez à un problème dans votre domaine qui pourrait être résolu par le ML"
          ],
          resources: [
            {
              title: "Andrew Ng's Machine Learning Course",
              url: "https://www.coursera.org/learn/machine-learning"
            },
            {
              title: "scikit-learn Documentation",
              url: "https://scikit-learn.org/stable/"
            }
          ]
        },
        {
          title: "Mathématiques pour le Machine Learning",
          duration: "2h",
          description: "Revue des concepts mathématiques essentiels : algèbre linéaire, statistiques et probabilités.",
          topics: [
            "Vecteurs et matrices",
            "Statistiques descriptives",
            "Probabilités et distributions",
            "Dérivées et optimisation"
          ],
          content: `Les mathématiques sont le langage du Machine Learning. Bien qu'il existe des outils qui abstraient la complexité mathématique, comprendre les fondamentaux vous permettra de :
- Choisir le bon algorithme pour votre problème
- Interpréter les résultats correctement
- Déboguer et optimiser vos modèles
- Innover et créer de nouvelles approches

Algèbre Linéaire :
Les données en ML sont représentées sous forme de vecteurs et matrices. Un vecteur est une liste de nombres (par exemple, les caractéristiques d'une maison), et une matrice est un tableau 2D (par exemple, un dataset complet).

Statistiques :
Les statistiques nous permettent de comprendre nos données :
- Moyenne : valeur centrale
- Écart-type : mesure de dispersion
- Corrélation : relation entre variables

Probabilités :
Le ML fait des prédictions probabilistes. Comprendre les probabilités permet d'interpréter la confiance du modèle dans ses prédictions.`,
          examples: [
            "Calcul de distance euclidienne entre deux points pour KNN",
            "Utilisation de la moyenne et de l'écart-type pour normaliser les données",
            "Calcul de probabilités conditionnelles pour Naive Bayes"
          ],
          exercises: [
            "Calculez la distance entre deux vecteurs [1,2,3] et [4,5,6]",
            "Normalisez le dataset : [10, 20, 30, 40, 50]",
            "Calculez P(A|B) sachant P(A)=0.3, P(B)=0.5, P(A∩B)=0.15"
          ]
        },
        {
          title: "Préparation des Données",
          duration: "2h30",
          description: "Apprenez à nettoyer, transformer et préparer vos données pour l'entraînement.",
          topics: [
            "Nettoyage des données",
            "Gestion des valeurs manquantes",
            "Encodage des variables catégorielles",
            "Normalisation et standardisation",
            "Division train/test"
          ],
          content: `La préparation des données représente souvent 80% du travail en Machine Learning. Des données de qualité sont cruciales pour obtenir de bons résultats.

Étapes de préparation :

1. Exploration des données
- Analyser les statistiques descriptives
- Visualiser les distributions
- Identifier les outliers

2. Nettoyage
- Supprimer les doublons
- Corriger les erreurs
- Traiter les valeurs aberrantes

3. Transformation
- Encoder les variables catégorielles (One-Hot Encoding)
- Normaliser les features numériques
- Créer de nouvelles features (Feature Engineering)

4. Division
- Séparer en ensembles train/test (70/30 ou 80/20)
- Créer un ensemble de validation si nécessaire`,
          examples: [
            "Remplir les valeurs manquantes par la médiane pour des données numériques",
            "One-Hot Encoding pour convertir 'rouge', 'vert', 'bleu' en vecteurs binaires",
            "StandardScaler pour normaliser les features avec moyenne=0 et écart-type=1"
          ],
          exercises: [
            "Chargez un dataset et identifiez les valeurs manquantes",
            "Appliquez One-Hot Encoding sur une colonne catégorielle",
            "Divisez un dataset en 80% train et 20% test"
          ]
        }
      ]
    }
  };

  return (
    <div className="test-app">
      <h1>Test du Lecteur de Cours IA</h1>
      <button 
        onClick={() => setShowReader(true)}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.125rem',
          background: '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        📖 Ouvrir le Cours de Test
      </button>

      {showReader && (
        <CourseReader
          course={testCourse}
          onClose={() => setShowReader(false)}
          onProgressUpdate={(progress) => {
            console.log('Progression:', progress + '%');
          }}
        />
      )}
    </div>
  );
}

// ========================================
// EXPORTS
// ========================================

export { AppWithCourseReader, TestCourseReader };
export default TestCourseReader;
