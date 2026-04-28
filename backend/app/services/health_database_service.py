import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class HealthDatabaseService:
    """Service for government health database integration and outbreak management"""
    
    def __init__(self):
        # Mock database - in production, integrate with actual government APIs
        self.disease_database = {
            "malaria": {
                "name": "Malaria",
                "overview": "A mosquito-borne infectious disease caused by Plasmodium parasites",
                "symptoms": "Fever, chills, headache, muscle pain, fatigue",
                "prevention": "Use mosquito nets, insect repellent, remove stagnant water",
                "treatment": "Antimalarial medications - consult doctor immediately",
                "severity": "High"
            },
            "dengue": {
                "name": "Dengue Fever",
                "overview": "A mosquito-borne viral infection causing flu-like illness",
                "symptoms": "High fever, severe headache, pain behind eyes, joint pain, rash",
                "prevention": "Prevent mosquito bites, remove breeding sites",
                "treatment": "Rest, fluids, paracetamol - avoid aspirin",
                "severity": "High"
            },
            "covid": {
                "name": "COVID-19",
                "overview": "Respiratory illness caused by SARS-CoV-2 virus",
                "symptoms": "Fever, cough, fatigue, loss of taste/smell, breathing difficulty",
                "prevention": "Vaccination, masks, hand hygiene, social distancing",
                "treatment": "Supportive care, antivirals in severe cases",
                "severity": "High"
            },
            "tuberculosis": {
                "name": "Tuberculosis",
                "overview": "Bacterial infection primarily affecting lungs",
                "symptoms": "Persistent cough, weight loss, night sweats, fever",
                "prevention": "BCG vaccine, avoid close contact with infected",
                "treatment": "6-month antibiotic course - must complete",
                "severity": "High"
            },
            "diabetes": {
                "name": "Diabetes",
                "overview": "Chronic condition affecting blood sugar regulation",
                "symptoms": "Increased thirst, frequent urination, hunger, fatigue",
                "prevention": "Healthy diet, exercise, maintain healthy weight",
                "treatment": "Medication, insulin, lifestyle changes",
                "severity": "Chronic"
            },
            "hypertension": {
                "name": "Hypertension",
                "overview": "High blood pressure condition",
                "symptoms": "Often no symptoms - silent killer",
                "prevention": "Low salt diet, exercise, stress management",
                "treatment": "Medication, lifestyle modifications",
                "severity": "Chronic"
            }
        }
        
        # Active outbreaks (mock data)
        self.active_outbreaks = []
    
    async def get_disease_info(self, query: str) -> Optional[Dict]:
        """Get disease information from database"""
        try:
            query_lower = query.lower()
            
            for disease_key, disease_data in self.disease_database.items():
                if disease_key in query_lower or disease_data['name'].lower() in query_lower:
                    return disease_data
            
            return None
            
        except Exception as e:
            logger.error(f"Disease info retrieval error: {str(e)}")
            return None
    
    async def get_active_outbreaks(self, region: str = None) -> List[Dict]:
        """Get active disease outbreaks"""
        try:
            # In production, fetch from government health department API
            # For now, return mock data
            mock_outbreaks = [
                {
                    "disease": "Dengue",
                    "location": "Kerala, Karnataka",
                    "cases": 245,
                    "deaths": 3,
                    "precautions": "Use mosquito nets, remove stagnant water, wear full sleeves",
                    "last_updated": datetime.now().isoformat()
                },
                {
                    "disease": "Seasonal Flu",
                    "location": "Delhi NCR",
                    "cases": 1200,
                    "deaths": 0,
                    "precautions": "Wash hands frequently, avoid crowded places, get flu vaccine",
                    "last_updated": datetime.now().isoformat()
                }
            ]
            
            return mock_outbreaks
            
        except Exception as e:
            logger.error(f"Outbreak data error: {str(e)}")
            return []
    
    async def report_outbreak(self, disease: str, location: str, cases: int) -> bool:
        """Report a new outbreak to the system"""
        try:
            outbreak = {
                "disease": disease,
                "location": location,
                "cases": cases,
                "reported_at": datetime.now().isoformat(),
                "status": "active"
            }
            
            self.active_outbreaks.append(outbreak)
            logger.info(f"Outbreak reported: {disease} in {location}")
            return True
            
        except Exception as e:
            logger.error(f"Outbreak reporting error: {str(e)}")
            return False
    
    async def get_health_statistics(self, region: str = None) -> Dict:
        """Get health statistics from government data"""
        try:
            # Mock statistics - integrate with real government APIs
            return {
                "total_vaccinations": "2.2 billion+",
                "active_cases": "15,000+",
                "recovery_rate": "98.5%",
                "health_centers": "25,000+",
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Health statistics error: {str(e)}")
            return {}
    
    async def get_nearby_health_centers(self, latitude: float, longitude: float) -> List[Dict]:
        """Get nearby health centers using government health facility database"""
        try:
            # Mock health centers - integrate with real government API
            return [
                {
                    "name": "Primary Health Center",
                    "type": "PHC",
                    "distance": "2.5 km",
                    "services": ["OPD", "Vaccination", "Maternity"],
                    "contact": "+91-XXXXXXXXXX",
                    "timing": "9 AM - 5 PM"
                },
                {
                    "name": "Community Health Center",
                    "type": "CHC",
                    "distance": "8 km",
                    "services": ["OPD", "Emergency", "Lab", "X-Ray"],
                    "contact": "108",
                    "timing": "24 hours"
                }
            ]
            
        except Exception as e:
            logger.error(f"Health centers error: {str(e)}")
            return []
