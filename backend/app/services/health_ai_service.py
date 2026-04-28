import os
import json
import logging
from typing import Dict, List, Optional
from openai import OpenAI
from app.core.config import settings
from app.services.translation_service import TranslationService
from app.services.vaccination_service import VaccinationService
from app.services.health_database_service import HealthDatabaseService

logger = logging.getLogger(__name__)

class HealthAIService:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY', '')
        self.client = OpenAI(api_key=api_key) if api_key else None
        self.translation = TranslationService()
        self.vaccination = VaccinationService()
        self.health_db = HealthDatabaseService()
        
        # Health education knowledge base
        self.health_topics = {
            "preventive": [
                "handwashing", "sanitation", "nutrition", "exercise", 
                "vaccination", "regular checkups", "hygiene"
            ],
            "symptoms": [
                "fever", "cough", "cold", "diarrhea", "vomiting", 
                "rash", "headache", "body pain", "breathing difficulty"
            ],
            "diseases": [
                "malaria", "dengue", "typhoid", "covid", "flu", 
                "diabetes", "hypertension", "tuberculosis"
            ]
        }
    
    async def process_health_query(
        self, 
        message: str, 
        phone_number: str,
        channel: str = "whatsapp"
    ) -> Dict:
        """
        Process health query with AI and return appropriate response
        """
        try:
            # Detect language
            detected_lang = await self.translation.detect_language(message)
            
            # Translate to English for processing
            if detected_lang != 'en':
                english_message = await self.translation.translate(message, 'en')
            else:
                english_message = message
            
            # Classify query intent
            intent = self._classify_intent(english_message)
            
            # Generate response based on intent
            if intent == "vaccination":
                response = await self._handle_vaccination_query(english_message)
            elif intent == "symptoms":
                response = await self._handle_symptom_query(english_message)
            elif intent == "disease_info":
                response = await self._handle_disease_info(english_message)
            elif intent == "outbreak":
                response = await self._handle_outbreak_query(english_message)
            else:
                response = await self._generate_general_health_response(english_message)
            
            # Translate response back to user's language
            if detected_lang != 'en':
                response = await self.translation.translate(response, detected_lang)
            
            # Format for channel (SMS needs shorter messages)
            if channel == "sms":
                response = self._format_for_sms(response)
            
            return {
                "message": response,
                "language": detected_lang,
                "confidence": 0.85,
                "category": intent
            }
            
        except Exception as e:
            logger.error(f"Health AI processing error: {str(e)}")
            return {
                "message": "I'm sorry, I couldn't process your query. Please try again or contact a healthcare provider.",
                "language": "en",
                "confidence": 0.0,
                "category": "error"
            }
    
    def _classify_intent(self, message: str) -> str:
        """Classify the intent of the health query"""
        message_lower = message.lower()
        
        # Check for vaccination keywords
        vaccination_keywords = ['vaccine', 'vaccination', 'immunization', 'shot', 'dose', 'schedule']
        if any(keyword in message_lower for keyword in vaccination_keywords):
            return "vaccination"
        
        # Check for symptom keywords
        symptom_keywords = ['symptom', 'feeling', 'pain', 'fever', 'cough', 'sick', 'hurt']
        if any(keyword in message_lower for keyword in symptom_keywords):
            return "symptoms"
        
        # Check for disease keywords
        disease_keywords = ['disease', 'malaria', 'dengue', 'covid', 'diabetes', 'infection']
        if any(keyword in message_lower for keyword in disease_keywords):
            return "disease_info"
        
        # Check for outbreak keywords
        outbreak_keywords = ['outbreak', 'epidemic', 'spread', 'alert', 'warning']
        if any(keyword in message_lower for keyword in outbreak_keywords):
            return "outbreak"
        
        return "general"
    
    async def _handle_vaccination_query(self, message: str) -> str:
        """Handle vaccination-related queries"""
        try:
            # Extract age if mentioned
            import re
            age_match = re.search(r'(\d+)\s*(year|month)', message.lower())
            age_months = None
            if age_match:
                age_val = int(age_match.group(1))
                unit = age_match.group(2)
                age_months = age_val * 12 if unit == 'year' else age_val
            
            # Get vaccination schedule
            schedule = await self.vaccination.get_schedule(age_months)
            
            response = "💉 Vaccination Information:\n\n"
            for vaccine in schedule:
                response += f"• {vaccine['name']}: {vaccine['schedule']}\n"
            
            response += "\nPlease consult your nearest health center for vaccination."
            return response
            
        except Exception as e:
            logger.error(f"Vaccination query error: {str(e)}")
            return "For vaccination schedules, please contact your nearest Primary Health Center (PHC) or visit the government's Universal Immunization Program website."
    
    async def _handle_symptom_query(self, message: str) -> str:
        """Handle symptom-related queries with AI"""
        try:
            if not self.client:
                return self._get_fallback_symptom_response(message)
            
            prompt = f"""You are a helpful health assistant for rural India. A user has described these symptoms: '{message}'
            
Provide:
1. Possible common conditions (not a diagnosis)
2. Immediate home remedies if safe
3. When to see a doctor urgently
4. Prevention tips

Keep it simple, empathetic, and in bullet points. Add a disclaimer that this is not medical advice."""
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful health education assistant for rural communities in India. Provide simple, accurate health information."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Symptom AI error: {str(e)}")
            return self._get_fallback_symptom_response(message)
    
    def _get_fallback_symptom_response(self, message: str) -> str:
        """Fallback response for symptom queries"""
        return """🩺 Symptom Checker:

Based on your description, here are some general guidelines:

1. **Rest and Hydration**: Drink plenty of fluids and get adequate rest
2. **Monitor Symptoms**: Keep track of temperature, pain level, and duration
3. **Home Remedies**: 
   - For fever: Lukewarm sponging
   - For cold: Steam inhalation, warm fluids
   - For stomach issues: ORS solution, light food

⚠️ **Seek immediate medical care if:**
- High fever (>102°F) lasting more than 2 days
- Difficulty breathing
- Severe chest pain
- Unconsciousness or confusion
- Severe dehydration

📞 Call 108 for emergency ambulance services

*This is not a medical diagnosis. Please consult a doctor for proper evaluation.*"""
    
    async def _handle_disease_info(self, message: str) -> str:
        """Handle disease information queries"""
        try:
            disease_info = await self.health_db.get_disease_info(message)
            if disease_info:
                return f"""📋 {disease_info['name']} Information:

**Overview:** {disease_info['overview']}

**Symptoms:** {disease_info['symptoms']}

**Prevention:** {disease_info['prevention']}

**Treatment:** {disease_info['treatment']}

For more information, visit your nearest health center or call the Health Helpline: 104"""
            else:
                return "I don't have specific information about that condition. Please consult a healthcare provider or call the Health Helpline: 104"
                
        except Exception as e:
            logger.error(f"Disease info error: {str(e)}")
            return "For disease information, please contact the Health Helpline: 104 or visit your nearest health center."
    
    async def _handle_outbreak_query(self, message: str) -> str:
        """Handle outbreak-related queries"""
        try:
            outbreaks = await self.health_db.get_active_outbreaks()
            if outbreaks:
                response = "🚨 Current Health Alerts:\n\n"
                for outbreak in outbreaks:
                    response += f"• {outbreak['disease']} - {outbreak['location']}\n"
                    response += f"  Precautions: {outbreak['precautions']}\n\n"
                return response
            else:
                return "✅ No active disease outbreaks reported in your area. Continue following preventive measures!"
                
        except Exception as e:
            logger.error(f"Outbreak query error: {str(e)}")
            return "For outbreak information, please check official government health department announcements or call 104."
    
    async def _generate_general_health_response(self, message: str) -> str:
        """Generate general health education response"""
        try:
            if not self.client:
                return self._get_fallback_health_response()
            
            prompt = f"""You are a health education assistant for rural India. Answer this health question: '{message}'

Provide:
1. Clear, simple explanation
2. Practical advice
3. When to seek medical help
4. Prevention tips if applicable

Keep it friendly and easy to understand."""
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful health education assistant for rural communities in India."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"General health AI error: {str(e)}")
            return self._get_fallback_health_response()
    
    def _get_fallback_health_response(self) -> str:
        """Fallback general health response"""
        return """🏥 Health Information:

Here are some important health tips:

**Preventive Healthcare:**
• Wash hands regularly with soap
• Drink clean, boiled water
• Eat nutritious food - fruits, vegetables, proteins
• Get adequate sleep (7-8 hours)
• Exercise regularly

**When to see a doctor:**
• Persistent fever or pain
• Unusual symptoms
• Chronic conditions
• Before starting any medication

**Emergency:** Call 108 for ambulance
**Health Helpline:** Call 104 for advice

How else can I help you today?"""
    
    def _format_for_sms(self, message: str) -> str:
        """Format message for SMS (160 char limit per segment)"""
        if len(message) <= 160:
            return message
        
        # Truncate with key info preserved
        lines = message.split('\n')
        short_lines = []
        current_length = 0
        
        for line in lines:
            if current_length + len(line) + 1 <= 320:  # 2 SMS segments
                short_lines.append(line)
                current_length += len(line) + 1
            else:
                break
        
        result = '\n'.join(short_lines)
        if len(result) > 320:
            result = result[:317] + "..."
        
        return result
