import os
import json
import logging
from typing import Dict, List, Any, Optional

from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


def _get_env(name: str, default: Optional[str] = None) -> str:
    value = os.getenv(name, default)
    if value is None or value.strip() == "":
        raise RuntimeError(f"Missing environment variable: {name}")
    return value


class LearningService:
    """Service for AI-powered learning content generation"""

    @staticmethod
    def _client() -> AsyncOpenAI:
        base_url = _get_env("AI_BASE_URL")
        api_key = _get_env("AI_API_KEY")
        app_url = os.getenv("APP_URL", "http://localhost:8000")
        app_name = os.getenv("APP_NAME", "EcoLearn AI")

        return AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            default_headers={
                # Recommandé par OpenRouter, inoffensif ailleurs
                "HTTP-Referer": app_url,
                "X-Title": app_name,
            },
        )

    @staticmethod
    async def generate_course_content(
        topic: str,
        difficulty: str,
        duration: str,
        focus_areas: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        focus_str = ", ".join(focus_areas) if focus_areas else "général"
        model = _get_env("AI_MODEL", "openai/gpt-4o-mini")

        system_prompt = (
            "Tu es un expert pédagogique spécialisé dans la création de contenu "
            "éducatif adaptatif et éco-responsable. Tu génères des cours structurés, "
            "engageants et orientés vers la durabilité."
        )

        user_prompt = f"""
Génère un cours complet sur le sujet suivant:

Sujet: {topic}
Niveau: {difficulty}
Durée estimée: {duration}
Axes prioritaires: {focus_str}

Le cours doit inclure:
1. Un titre accrocheur
2. Une description détaillée (2-3 paragraphes)
3. Des objectifs d'apprentissage (4-6)
4. Une structure en modules (6-12 selon la durée)
5. Pour chaque module:
   - Titre
   - Durée
   - Contenu (concepts clés + exemples)
   - Exercices/quiz
   - Lien durabilité si pertinent
6. Ressources supplémentaires
7. Projet final / étude de cas

Réponds STRICTEMENT en JSON avec cette structure:
{{
  "title": "Titre du cours",
  "description": "Description complète",
  "objectives": ["objectif 1", "objectif 2"],
  "modules": [
    {{
      "id": 1,
      "title": "Titre du module",
      "duration": "45min",
      "content": "Contenu détaillé...",
      "exercises": ["exercice 1", "exercice 2"],
      "sustainability_note": "Lien avec la durabilité"
    }}
  ],
  "resources": ["ressource 1", "ressource 2"],
  "final_project": "Description du projet final",
  "estimated_carbon_impact": 15.5
}}
        """.strip()

        client = LearningService._client()

        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=4000,
                response_format={"type": "json_object"},
            )

            raw = response.choices[0].message.content
            content = json.loads(raw)

            content["generation_metadata"] = {
                "model": response.model,
                "tokens_used": getattr(response.usage, "total_tokens", None),
                "difficulty": difficulty,
                "requested_duration": duration,
            }
            return content

        except json.JSONDecodeError:
            logger.exception("AI response is not valid JSON")
            raise
        except Exception:
            logger.exception("Error generating course content")
            raise

    @staticmethod
    async def generate_quiz(
        module_content: str,
        difficulty: str,
        num_questions: int = 5,
    ) -> List[Dict[str, Any]]:
        model = _get_env("AI_MODEL", "openai/gpt-4o-mini")

        system_prompt = (
            "Tu es un expert en évaluation pédagogique. "
            "Tu crées des quiz engageants pour valider la compréhension."
        )

        user_prompt = f"""
Génère {num_questions} questions basées sur ce contenu (extrait):

{module_content[:1000]}

Niveau: {difficulty}

Réponds STRICTEMENT en JSON:
{{
  "questions": [
    {{
      "question": "Question ?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "explanation": "Explication"
    }}
  ]
}}
        """.strip()

        client = LearningService._client()

        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.6,
                max_tokens=2000,
                response_format={"type": "json_object"},
            )

            raw = response.choices[0].message.content
            data = json.loads(raw)
            return data.get("questions", [])

        except Exception:
            logger.exception("Error generating quiz")
            return []
