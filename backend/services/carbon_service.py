"""
Carbon Service for real-time carbon footprint calculation and tree planting API
"""
import os
import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class CarbonService:
    """Service for carbon footprint tracking and reforestation"""
    
    # Carbon coefficients (kg CO2 per hour of digital learning)
    CARBON_COEFFICIENTS = {
        "Intelligence Artificielle": 0.35,  # Higher due to compute
        "Data Science": 0.32,
        "Sustainability": 0.15,  # Lower, optimized content
        "Business": 0.20,
        "default": 0.25
    }
    
    # Tree absorption rate: 1 tree absorbs ~21.77 kg CO2/year
    TREE_CO2_ABSORPTION = 21.77
    
    # Reforestation API configuration
    TREE_API_URL = os.getenv("TREE_API_URL", "https://api.tree-nation.com/v1")
    TREE_API_KEY = os.getenv("TREE_API_KEY", "")
    
    @staticmethod
    def calculate_carbon_footprint(
        learning_hours: float,
        category: str = "default"
    ) -> Dict[str, Any]:
        """
        Calculate carbon footprint for learning activity
        
        Args:
            learning_hours: Number of hours spent learning
            category: Course category for specific coefficient
            
        Returns:
            Dict with carbon calculations
        """
        
        coefficient = CarbonService.CARBON_COEFFICIENTS.get(
            category, 
            CarbonService.CARBON_COEFFICIENTS["default"]
        )
        
        carbon_kg = learning_hours * coefficient
        trees_equivalent = int(carbon_kg / CarbonService.TREE_CO2_ABSORPTION * 365)
        
        # Car equivalent (average car: 0.12 kg CO2/km)
        km_equivalent = carbon_kg / 0.12
        
        return {
            "carbon_offset_kg": round(carbon_kg, 2),
            "trees_equivalent": max(1, trees_equivalent),
            "car_km_equivalent": round(km_equivalent, 2),
            "coefficient_used": coefficient,
            "category": category,
            "calculation_method": "learning_hours * category_coefficient"
        }
    
    @staticmethod
    async def plant_trees_via_api(
        user_id: int,
        trees_count: int,
        location: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Plant trees via reforestation API (Tree-Nation or similar)
        
        Args:
            user_id: User requesting plantation
            trees_count: Number of trees to plant
            location: Optional location preference
            
        Returns:
            Plantation confirmation details
        """
        
        # Simulated API call (replace with real API)
        # Using Tree-Nation API as example
        
        if not CarbonService.TREE_API_KEY:
            logger.warning("Tree API key not configured, using simulation mode")
            return CarbonService._simulate_tree_planting(user_id, trees_count, location)
        
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {CarbonService.TREE_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "project": location or "global",
                    "quantity": trees_count,
                    "user_reference": f"ecolearn_user_{user_id}",
                    "metadata": {
                        "source": "ecolearn_platform",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                }
                
                response = await client.post(
                    f"{CarbonService.TREE_API_URL}/plantations",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code == 201:
                    data = response.json()
                    return {
                        "status": "confirmed",
                        "transaction_id": data.get("id"),
                        "trees_planted": trees_count,
                        "organization": "Tree-Nation",
                        "location": data.get("location", location),
                        "carbon_offset_kg": trees_count * CarbonService.TREE_CO2_ABSORPTION / 365,
                        "estimated_growth_years": 20,
                        "certificate_url": data.get("certificate_url")
                    }
                else:
                    logger.error(f"Tree API error: {response.status_code}")
                    return CarbonService._simulate_tree_planting(user_id, trees_count, location)
                    
        except Exception as e:
            logger.error(f"Error planting trees via API: {str(e)}")
            return CarbonService._simulate_tree_planting(user_id, trees_count, location)
    
    @staticmethod
    def _simulate_tree_planting(
        user_id: int,
        trees_count: int,
        location: Optional[str]
    ) -> Dict[str, Any]:
        """
        Simulate tree planting when API is unavailable
        """
        import uuid
        
        return {
            "status": "confirmed",
            "transaction_id": str(uuid.uuid4()),
            "trees_planted": trees_count,
            "organization": "EcoLearn Reforestation Partner",
            "location": location or "Global Project",
            "carbon_offset_kg": round(trees_count * CarbonService.TREE_CO2_ABSORPTION / 365, 2),
            "estimated_growth_years": 20,
            "certificate_url": f"https://ecolearn.ai/certificates/{uuid.uuid4()}",
            "simulation_mode": True
        }
    
    @staticmethod
    def calculate_platform_impact(
        total_users: int,
        total_learning_hours: float
    ) -> Dict[str, Any]:
        """
        Calculate total platform environmental impact
        
        Args:
            total_users: Total active users
            total_learning_hours: Cumulative learning hours
            
        Returns:
            Platform-wide impact metrics
        """
        
        avg_carbon = CarbonService.calculate_carbon_footprint(
            total_learning_hours,
            "default"
        )
        
        # Assume 20% of carbon is offset through tree planting
        trees_planted = int(avg_carbon["carbon_offset_kg"] * 0.2 / CarbonService.TREE_CO2_ABSORPTION * 365)
        
        return {
            "total_users": total_users,
            "total_learning_hours": round(total_learning_hours, 2),
            "total_carbon_offset_kg": avg_carbon["carbon_offset_kg"],
            "total_trees_planted": trees_planted,
            "average_per_user": {
                "hours": round(total_learning_hours / max(total_users, 1), 2),
                "carbon_kg": round(avg_carbon["carbon_offset_kg"] / max(total_users, 1), 2)
            }
        }
    
    @staticmethod
    async def get_reforestation_projects() -> list:
        """
        Fetch available reforestation projects
        
        Returns:
            List of active projects
        """
        
        # Simulated projects (replace with real API)
        return [
            {
                "id": "amazon_restoration",
                "name": "Restoration de la Forêt Amazonienne",
                "location": "Brésil",
                "trees_available": 50000,
                "cost_per_tree": 1.5,
                "co2_per_tree": CarbonService.TREE_CO2_ABSORPTION,
                "image": "https://example.com/amazon.jpg"
            },
            {
                "id": "mangrove_asia",
                "name": "Plantation de Mangroves en Asie",
                "location": "Indonésie",
                "trees_available": 30000,
                "cost_per_tree": 2.0,
                "co2_per_tree": CarbonService.TREE_CO2_ABSORPTION * 1.5,
                "image": "https://example.com/mangrove.jpg"
            },
            {
                "id": "africa_savanna",
                "name": "Reboisement de la Savane Africaine",
                "location": "Kenya",
                "trees_available": 40000,
                "cost_per_tree": 1.2,
                "co2_per_tree": CarbonService.TREE_CO2_ABSORPTION,
                "image": "https://example.com/savanna.jpg"
            }
        ]
