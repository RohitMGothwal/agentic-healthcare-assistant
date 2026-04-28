import logging
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class VaccinationService:
    """Service for vaccination schedules and information"""
    
    def __init__(self):
        # Universal Immunization Program (UIP) Schedule - India
        self.vaccination_schedule = {
            "birth": [
                {"name": "BCG", "prevents": "Tuberculosis", "dose": "1st"},
                {"name": "Hepatitis B (Birth dose)", "prevents": "Hepatitis B", "dose": "1st"},
                {"name": "OPV (Birth dose)", "prevents": "Polio", "dose": "1st"}
            ],
            "6_weeks": [
                {"name": "DPT-1", "prevents": "Diphtheria, Pertussis, Tetanus", "dose": "1st"},
                {"name": "IPV-1", "prevents": "Polio", "dose": "1st"},
                {"name": "Hepatitis B-2", "prevents": "Hepatitis B", "dose": "2nd"},
                {"name": "Hib-1", "prevents": "Haemophilus influenzae type b", "dose": "1st"},
                {"name": "Rotavirus-1", "prevents": "Rotavirus diarrhea", "dose": "1st"},
                {"name": "PCV-1", "prevents": "Pneumococcal disease", "dose": "1st"}
            ],
            "10_weeks": [
                {"name": "DPT-2", "prevents": "Diphtheria, Pertussis, Tetanus", "dose": "2nd"},
                {"name": "IPV-2", "prevents": "Polio", "dose": "2nd"},
                {"name": "Hib-2", "prevents": "Haemophilus influenzae type b", "dose": "2nd"},
                {"name": "Rotavirus-2", "prevents": "Rotavirus diarrhea", "dose": "2nd"},
                {"name": "PCV-2", "prevents": "Pneumococcal disease", "dose": "2nd"}
            ],
            "14_weeks": [
                {"name": "DPT-3", "prevents": "Diphtheria, Pertussis, Tetanus", "dose": "3rd"},
                {"name": "IPV-3", "prevents": "Polio", "dose": "3rd"},
                {"name": "Hib-3", "prevents": "Haemophilus influenzae type b", "dose": "3rd"},
                {"name": "Rotavirus-3", "prevents": "Rotavirus diarrhea", "dose": "3rd"},
                {"name": "PCV-3", "prevents": "Pneumococcal disease", "dose": "3rd"}
            ],
            "9_months": [
                {"name": "MR-1", "prevents": "Measles, Rubella", "dose": "1st"},
                {"name": "JE-1", "prevents": "Japanese Encephalitis", "dose": "1st"}
            ],
            "16_months": [
                {"name": "MR-2", "prevents": "Measles, Rubella", "dose": "2nd"},
                {"name": "JE-2", "prevents": "Japanese Encephalitis", "dose": "2nd"}
            ],
            "5_years": [
                {"name": "DPT Booster", "prevents": "Diphtheria, Pertussis, Tetanus", "dose": "Booster"}
            ],
            "10_years": [
                {"name": "TT", "prevents": "Tetanus", "dose": "1st"}
            ],
            "16_years": [
                {"name": "TT", "prevents": "Tetanus", "dose": "2nd"}
            ]
        }
    
    async def get_schedule(self, age_months: int = None) -> List[Dict]:
        """Get vaccination schedule based on age"""
        try:
            if age_months is None:
                # Return complete schedule
                return self._format_complete_schedule()
            
            # Determine age group
            if age_months < 1:
                return self.vaccination_schedule.get("birth", [])
            elif age_months <= 2:
                return self.vaccination_schedule.get("6_weeks", [])
            elif age_months <= 3:
                return self.vaccination_schedule.get("10_weeks", [])
            elif age_months <= 4:
                return self.vaccination_schedule.get("14_weeks", [])
            elif age_months <= 9:
                return self.vaccination_schedule.get("9_months", [])
            elif age_months <= 16:
                return self.vaccination_schedule.get("16_months", [])
            elif age_months <= 60:  # 5 years
                return self.vaccination_schedule.get("5_years", [])
            elif age_months <= 120:  # 10 years
                return self.vaccination_schedule.get("10_years", [])
            else:
                return self.vaccination_schedule.get("16_years", [])
                
        except Exception as e:
            logger.error(f"Vaccination schedule error: {str(e)}")
            return []
    
    def _format_complete_schedule(self) -> List[Dict]:
        """Format complete vaccination schedule"""
        complete = []
        for age_group, vaccines in self.vaccination_schedule.items():
            for vaccine in vaccines:
                complete.append({
                    "name": vaccine["name"],
                    "schedule": vaccine["dose"],
                    "prevents": vaccine["prevents"],
                    "age_group": age_group
                })
        return complete
    
    async def get_vaccine_info(self, vaccine_name: str) -> Dict:
        """Get detailed information about a specific vaccine"""
        try:
            vaccine_info = {
                "BCG": {
                    "full_name": "Bacillus Calmette-Guérin",
                    "prevents": "Tuberculosis",
                    "doses": "1",
                    "timing": "At birth",
                    "side_effects": "Mild fever, small sore at injection site"
                },
                "DPT": {
                    "full_name": "Diphtheria, Pertussis, Tetanus",
                    "prevents": "Diphtheria, Whooping cough, Tetanus",
                    "doses": "3 primary + 2 boosters",
                    "timing": "6, 10, 14 weeks, 5 years",
                    "side_effects": "Mild fever, soreness at injection site"
                },
                "OPV": {
                    "full_name": "Oral Polio Vaccine",
                    "prevents": "Polio",
                    "doses": "4",
                    "timing": "Birth, 6, 10, 14 weeks",
                    "side_effects": "Very rare - vaccine-associated polio"
                },
                "Measles": {
                    "full_name": "Measles Rubella Vaccine",
                    "prevents": "Measles, Rubella",
                    "doses": "2",
                    "timing": "9-12 months, 16-24 months",
                    "side_effects": "Mild fever, rash"
                }
            }
            
            return vaccine_info.get(vaccine_name, {
                "message": "Vaccine information not found. Please contact your health center."
            })
            
        except Exception as e:
            logger.error(f"Vaccine info error: {str(e)}")
            return {"error": "Could not retrieve vaccine information"}
