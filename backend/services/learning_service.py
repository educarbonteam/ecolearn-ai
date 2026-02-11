"""
OpenAI Service for AI-powered course generation
"""
import os
import json
from typing import Dict, List, Any
from openai import AsyncOpenAI
import logging

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class LearningService:
    """Service for AI-powered learning content generation"""
    
    @staticmethod
    async def generate_course_content(
        topic: str,
        difficulty: str,
        duration: str,
        focus_areas: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate adaptive learning content using OpenAI GPT
        
        Args:
            topic: Course topic
            difficulty: Beginner, Intermediate, or Advanced
            duration: Estimated duration
            focus_areas: Specific areas to focus on
            
        Returns:
            Dict containing structured course content
        """
        
        focus_str = ", ".join(focus_areas) if focus_areas else "général"
        
        system_prompt = """Tu es un expert pédagogique spécialisé dans la création de contenu 
        éducatif adaptatif et éco-responsable. Tu génères des cours structurés, engageants et 
        orientés vers la durabilité."""
        
        user_prompt = f"""
        Génère un cours complet sur le sujet suivant:
        
        Sujet: {topic}
        Niveau: {difficulty}
        Durée estimée: {duration}
        Axes prioritaires: {focus_str}
        
        Le cours doit inclure:
        1. Un titre accrocheur
        2. Une description détaillée (2-3 paragraphs)
        3. Des objectifs d'apprentissage clairs (4-6 objectifs)
        4. Une structure en modules (6-12 modules selon la durée)
        5. Pour chaque module:
           - Titre du module
           - Durée estimée
           - Contenu détaillé (concepts clés, exemples pratiques)
           - Exercices ou quiz
           - Liens avec la durabilité/écologie quand pertinent
        6. Des ressources supplémentaires
        7. Un projet final ou étude de cas
        
        Formate la réponse en JSON avec cette structure:
        {{
            "title": "Titre du cours",
            "description": "Description complète",
            "objectives": ["objectif 1", "objectif 2", ...],
            "modules": [
                {{
                    "id": 1,
                    "title": "Titre du module",
                    "duration": "45min",
                    "content": "Contenu détaillé...",
                    "exercises": ["exercice 1", ...],
                    "sustainability_note": "Lien avec la durabilité"
                }}
            ],
            "resources": ["ressource 1", "ressource 2", ...],
            "final_project": "Description du projet final",
            "estimated_carbon_impact": 15.5
        }}
        """
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=4000,
                response_format={"type": "json_object"}
            )
            
            content = json.loads(response.choices[0].message.content)
            
            # Add metadata
            content["generation_metadata"] = {
                "model": "gpt-4-turbo",
                "tokens_used": response.usage.total_tokens,
                "difficulty": difficulty,
                "requested_duration": duration
            }
            
            logger.info(f"Successfully generated course content for topic: {topic}")
            return content
            
        except Exception as e:
            logger.error(f"Error generating course content: {str(e)}")
            raise
    
    @staticmethod
    async def generate_personalized_recommendations(
        user_profile: Dict[str, Any],
        completed_courses: List[str],
        limit: int = 3
    ) -> List[Dict[str, str]]:
        """
        Generate personalized course recommendations based on user profile
        
        Args:
            user_profile: User learning profile and interests
            completed_courses: List of completed course titles
            limit: Number of recommendations
            
        Returns:
            List of recommended courses
        """
        
        system_prompt = """Tu es un conseiller pédagogique IA spécialisé dans les 
        recommandations personnalisées de cours éco-responsables."""
        
        user_prompt = f"""
        Profil utilisateur:
        - Niveau: {user_profile.get('level', 'Débutant')}
        - Heures d'apprentissage: {user_profile.get('learning_hours', 0)}
        - Cours complétés: {', '.join(completed_courses) if completed_courses else 'Aucun'}
        
        Recommande {limit} cours qui:
        1. Correspondent au niveau de l'utilisateur
        2. Prolongent naturellement ses apprentissages
        3. Intègrent une dimension environnementale/durable
        
        Retourne un JSON avec cette structure:
        {{
            "recommendations": [
                {{
                    "title": "Titre du cours",
                    "category": "Catégorie",
                    "difficulty": "Niveau",
                    "duration": "Durée",
                    "reason": "Pourquoi ce cours est recommandé",
                    "sustainability_angle": "Lien avec la durabilité"
                }}
            ]
        }}
        """
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            
            content = json.loads(response.choices[0].message.content)
            return content.get("recommendations", [])
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return []
    
    @staticmethod
    async def generate_quiz(
        module_content: str,
        difficulty: str,
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generate adaptive quiz questions for a module
        
        Args:
            module_content: Content of the module
            difficulty: Question difficulty level
            num_questions: Number of questions to generate
            
        Returns:
            List of quiz questions with answers
        """
        
        system_prompt = """Tu es un expert en évaluation pédagogique. Tu crées des quiz 
        engageants et pertinents pour valider la compréhension des apprenants."""
        
        user_prompt = f"""
        Génère {num_questions} questions de quiz basées sur ce contenu:
        
        {module_content[:1000]}  # Limit content length
        
        Niveau de difficulté: {difficulty}
        
        Format JSON:
        {{
            "questions": [
                {{
                    "question": "Question ici?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": 0,
                    "explanation": "Explication de la réponse"
                }}
            ]
        }}
        """
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.6,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            content = json.loads(response.choices[0].message.content)
            return content.get("questions", [])
            
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            return []
