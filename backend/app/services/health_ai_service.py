import os
import json
import logging
import re
from typing import Dict, List, Optional
from openai import OpenAI
import requests
from app.core.config import settings
from app.services.translation_service import TranslationService
from app.services.vaccination_service import VaccinationService
from app.services.health_database_service import HealthDatabaseService

logger = logging.getLogger(__name__)

class HealthAIService:
    def __init__(self):
        self.ai_provider = settings.ai_provider
        
        # OpenAI Configuration
        openai_api_key = settings.openai_api_key or os.getenv('OPENAI_API_KEY', '')
        self.openai_client = OpenAI(api_key=openai_api_key) if openai_api_key else None
        
        # Groq Configuration (Free tier available!)
        groq_api_key = settings.groq_api_key or os.getenv('GROQ_API_KEY', '')
        self.groq_client = None
        if groq_api_key:
            # Groq uses OpenAI-compatible API
            self.groq_client = OpenAI(
                api_key=groq_api_key,
                base_url="https://api.groq.com/openai/v1"
            )
        
        # Ollama Configuration (Self-hosted)
        self.use_ollama = settings.use_ollama
        self.ollama_url = settings.ollama_url
        self.ollama_model = settings.ollama_model
        
        self.translation = TranslationService()
        self.vaccination = VaccinationService()
        self.health_db = HealthDatabaseService()
        
        # Log which AI provider is being used
        if self.ai_provider == "groq" and self.groq_client:
            logger.info(f"Using Groq AI with model: {settings.groq_model}")
        elif self.ai_provider == "ollama" or self.use_ollama:
            logger.info(f"Using Ollama with model: {self.ollama_model}")
        elif self.openai_client:
            logger.info("Using OpenAI API")
        else:
            logger.warning("No AI client configured - using fallback responses")
        
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
    
    def _clean_response(self, text: str) -> str:
        """Clean up AI response formatting for better display"""
        if not text:
            return text
        
        # Remove excessive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Ensure bullet points are consistent
        text = re.sub(r'^[\*\-]\s+', '• ', text, flags=re.MULTILINE)
        
        # Clean up any trailing whitespace
        text = text.strip()
        
        return text
    
    def _call_ollama(self, messages: List[Dict], max_tokens: int = 500, temperature: float = 0.7) -> Optional[str]:
        """Call Ollama API with the given messages"""
        try:
            # Format messages for Ollama
            prompt = ""
            system_content = ""
            for msg in messages:
                if msg["role"] == "system":
                    system_content = msg["content"]
                elif msg["role"] == "user":
                    prompt = msg["content"]
            
            # Combine system and user messages
            full_prompt = f"{system_content}\n\n{prompt}" if system_content else prompt
            
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._clean_response(result.get("response", "").strip())
            else:
                logger.error(f"Ollama error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Ollama call error: {str(e)}")
            return None
    
    def _call_groq(self, messages: List[Dict], max_tokens: int = 500, temperature: float = 0.7) -> Optional[str]:
        """Call Groq API with the given messages"""
        try:
            if not self.groq_client:
                return None
            
            response = self.groq_client.chat.completions.create(
                model=settings.groq_model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            return self._clean_response(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Groq call error: {str(e)}")
            return None
    
    def _call_ai(self, messages: List[Dict], max_tokens: int = 500, temperature: float = 0.7) -> Optional[str]:
        """Call the configured AI provider (Groq, Ollama, or OpenAI)"""
        # Priority: Groq > Ollama > OpenAI
        
        # Try Groq first (if configured)
        if self.ai_provider == "groq" and self.groq_client:
            result = self._call_groq(messages, max_tokens, temperature)
            if result:
                return result
        
        # Try Ollama (if configured)
        if self.ai_provider == "ollama" or self.use_ollama:
            result = self._call_ollama(messages, max_tokens, temperature)
            if result:
                return result
        
        # Fall back to OpenAI
        if self.openai_client:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                return self._clean_response(response.choices[0].message.content)
            except Exception as e:
                logger.error(f"OpenAI call error: {str(e)}")
        
        return None
    
    def _has_ai_client(self) -> bool:
        """Check if we have an AI client available"""
        return self.openai_client is not None or self.groq_client is not None or self.use_ollama
    
    async def process_health_query(
        self,
        message: str,
        phone_number: str,
        channel: str = "whatsapp",
        language: str = None
    ) -> Dict:
        """
        Process health query with AI and return appropriate response
        """
        try:
            # Use provided language or auto-detect
            if language:
                detected_lang = language
            else:
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
                response = await self._handle_vaccination_query(english_message, detected_lang)
            elif intent == "symptoms":
                response = await self._handle_symptom_query(english_message, detected_lang)
            elif intent == "disease_info":
                response = await self._handle_disease_info(english_message, detected_lang)
            elif intent == "outbreak":
                response = await self._handle_outbreak_query(english_message, detected_lang)
            else:
                response = await self._generate_general_health_response(english_message, detected_lang)
            
            # No need to translate - AI already responded in target language
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
    
    async def _handle_vaccination_query(self, message: str, language: str = 'en') -> str:
        """Handle vaccination-related queries"""
        try:
            # Language instructions - all 23 supported languages
            lang_names = {
                'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'te': 'Telugu',
                'mr': 'Marathi', 'ta': 'Tamil', 'ur': 'Urdu', 'gu': 'Gujarati',
                'kn': 'Kannada', 'ml': 'Malayalam', 'or': 'Odia', 'zh': 'Chinese',
                'es': 'Spanish', 'tl': 'Tagalog', 'ar': 'Arabic', 'fr': 'French',
                'de': 'German', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean',
                'pt': 'Portuguese', 'ru': 'Russian', 'tr': 'Turkish'
            }
            lang_name = lang_names.get(language, 'English')
            
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
            
            if language == 'en':
                response = "💉 Vaccination Information:\n\n"
                for vaccine in schedule:
                    response += f"- {vaccine['name']}: {vaccine['schedule']}\n"
                response += "\nPlease consult your nearest health center for vaccination."
            else:
                # For non-English, ask AI to translate
                schedule_text = "\n".join([f"- {v['name']}: {v['schedule']}" for v in schedule])
                prompt = f"""Translate this vaccination information to {lang_name}:

Vaccination Information:
{schedule_text}

Please consult your nearest health center for vaccination.

Keep it simple and clear."""
                
                system_content = f"You are a helpful assistant. Translate to {lang_name}."
                
                # Use unified AI call
                ai_response = self._call_ai(
                    messages=[
                        {"role": "system", "content": system_content},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=500,
                    temperature=0.3
                )
                if ai_response:
                    response = self._clean_response(ai_response)
                else:
                    response = "For vaccination schedules, please contact your nearest Primary Health Center (PHC)."
            
            return response
            
        except Exception as e:
            logger.error(f"Vaccination query error: {str(e)}")
            if language == 'en':
                return "For vaccination schedules, please contact your nearest Primary Health Center (PHC) or visit the government's Universal Immunization Program website."
            else:
                return "Please contact your nearest health center for vaccination information."
    
    async def _handle_symptom_query(self, message: str, language: str = 'en') -> str:
        """Handle symptom-related queries with AI"""
        try:
            # Language instructions - all 23 supported languages
            lang_names = {
                'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'te': 'Telugu',
                'mr': 'Marathi', 'ta': 'Tamil', 'ur': 'Urdu', 'gu': 'Gujarati',
                'kn': 'Kannada', 'ml': 'Malayalam', 'or': 'Odia', 'zh': 'Chinese',
                'es': 'Spanish', 'tl': 'Tagalog', 'ar': 'Arabic', 'fr': 'French',
                'de': 'German', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean',
                'pt': 'Portuguese', 'ru': 'Russian', 'tr': 'Turkish'
            }
            lang_name = lang_names.get(language, 'English')
            
            prompt = f"""You are a helpful health assistant for rural India. A user has described these symptoms: '{message}'
            
IMPORTANT: Respond entirely in {lang_name} language.

Provide:
1. Possible common conditions (not a diagnosis)
2. Immediate home remedies if safe
3. When to see a doctor urgently
4. Prevention tips

Keep it simple, empathetic, and in bullet points. Add a disclaimer that this is not medical advice."""
            
            system_content = f"You are a helpful health education assistant for rural communities in India. Always respond in {lang_name} language."
            
            # Use unified AI call
            ai_response = self._call_ai(
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            if ai_response:
                return ai_response
            
            # If no AI available, use fallback
            return self._get_fallback_symptom_response(message, language)
            
        except Exception as e:
            logger.error(f"Symptom AI error: {str(e)}")
            return self._get_fallback_symptom_response(message, language)
    
    def _get_fallback_symptom_response(self, message: str, language: str = 'en') -> str:
        """Fallback response for symptom queries with keyword matching"""
        message_lower = message.lower()
        
        # Check for specific symptoms in the comprehensive health database
        # First check symptom-specific keywords
        symptom_keywords = {
            "fever": ["fever", "temperature", "hot", "chills", "sweating"],
            "headache": ["headache", "head pain", "migraine", "forehead pain"],
            "cough": ["cough", "coughing", "phlegm", "mucus", "dry cough"],
            "cold": ["cold", "runny nose", "stuffy nose", "sneezing", "nasal"],
            "flu": ["flu", "influenza", "body ache", "muscle pain", "chills"],
            "pain": ["pain", "ache", "hurt", "sore", "discomfort"],
            "allergy": ["allergy", "allergic", "sneezing", "itchy", "watery eyes"],
        }
        
        # Check which symptom category matches
        for symptom_type, keywords in symptom_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                # Return specific response from our knowledge base
                return self._get_fallback_health_response(message, language)
        
        # Default symptom response - translate if needed
        if language == 'en':
            return """ **Symptom Checker**

Based on your description, here are some general guidelines:

**Immediate Self-Care:**
- Rest and get adequate sleep
- Drink plenty of fluids (water, herbal tea)
- Monitor your symptoms
- Note when symptoms started

**Common Home Remedies:**
- **Fever**: Lukewarm sponging, light clothing
- **Cold**: Steam inhalation, saline gargle
- **Cough**: Honey (adults), warm fluids
- **Stomach issues**: ORS solution, bland diet
- **Headache**: Rest in dark room, hydration

**Track These Details:**
- Temperature (if fever)
- Duration of symptoms
- Severity (mild/moderate/severe)
- Any triggers or relief factors

⚠️ **Seek immediate medical care if:**
- High fever (>102°F/39°C) lasting >2 days
- Difficulty breathing or chest pain
- Severe headache with stiff neck
- Unconsciousness or confusion
- Severe dehydration (dry mouth, no urine)
- Symptoms worsen rapidly

 **Emergency:** Call 108 for ambulance
 **Health Helpline:** Call 104 for advice

*This is general guidance. Please consult a healthcare provider for proper diagnosis and treatment.*"""
        else:
            # For non-English, return a generic message
            return "Please consult a healthcare provider or call Health Helpline: 104 for symptom guidance."

    
    async def _handle_disease_info(self, message: str, language: str = 'en') -> str:
        """Handle disease information queries"""
        try:
            # Language instructions - all 23 supported languages
            lang_names = {
                'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'te': 'Telugu',
                'mr': 'Marathi', 'ta': 'Tamil', 'ur': 'Urdu', 'gu': 'Gujarati',
                'kn': 'Kannada', 'ml': 'Malayalam', 'or': 'Odia', 'zh': 'Chinese',
                'es': 'Spanish', 'tl': 'Tagalog', 'ar': 'Arabic', 'fr': 'French',
                'de': 'German', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean',
                'pt': 'Portuguese', 'ru': 'Russian', 'tr': 'Turkish'
            }
            lang_name = lang_names.get(language, 'English')
            
            disease_info = await self.health_db.get_disease_info(message)
            if disease_info:
                if language == 'en':
                    return f"""🏥 {disease_info['name']} Information:

**Overview:** {disease_info['overview']}

**Symptoms:** {disease_info['symptoms']}

**Prevention:** {disease_info['prevention']}

**Treatment:** {disease_info['treatment']}

For more information, visit your nearest health center or call the Health Helpline: 104"""
                else:
                    # Use AI to translate
                    prompt = f"""Translate this disease information to {lang_name}:

{disease_info['name']} Information:

Overview: {disease_info['overview']}
Symptoms: {disease_info['symptoms']}
Prevention: {disease_info['prevention']}
Treatment: {disease_info['treatment']}

For more information, visit your nearest health center or call the Health Helpline: 104

Keep it clear and accurate."""
                    
                    system_content = f"You are a medical translator. Translate to {lang_name}."
                    
                    # Use unified AI call
                    ai_response = self._call_ai(
                        messages=[
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=500,
                        temperature=0.3
                    )
                    if ai_response:
                        return ai_response
                    
                    return f"Please contact Health Helpline: 104 for {disease_info['name']} information."
            else:
                if language == 'en':
                    return "I don't have specific information about that condition. Please consult a healthcare provider or call the Health Helpline: 104"
                else:
                    return "Please consult a healthcare provider or call the Health Helpline: 104"
                
        except Exception as e:
            logger.error(f"Disease info error: {str(e)}")
            if language == 'en':
                return "For disease information, please contact the Health Helpline: 104 or visit your nearest health center."
            else:
                return "Please contact the Health Helpline: 104 or visit your nearest health center."
    
    async def _handle_outbreak_query(self, message: str, language: str = 'en') -> str:
        """Handle outbreak-related queries"""
        try:
            # Language instructions - all 23 supported languages
            lang_names = {
                'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'te': 'Telugu',
                'mr': 'Marathi', 'ta': 'Tamil', 'ur': 'Urdu', 'gu': 'Gujarati',
                'kn': 'Kannada', 'ml': 'Malayalam', 'or': 'Odia', 'zh': 'Chinese',
                'es': 'Spanish', 'tl': 'Tagalog', 'ar': 'Arabic', 'fr': 'French',
                'de': 'German', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean',
                'pt': 'Portuguese', 'ru': 'Russian', 'tr': 'Turkish'
            }
            lang_name = lang_names.get(language, 'English')
            
            outbreaks = await self.health_db.get_active_outbreaks()
            if outbreaks:
                if language == 'en':
                    response = "⚠️ Current Health Alerts:\n\n"
                    for outbreak in outbreaks:
                        response += f"- {outbreak['disease']} - {outbreak['location']}\n"
                        response += f"  Precautions: {outbreak['precautions']}\n\n"
                    return self._clean_response(response)
                else:
                    # Use AI to translate
                    outbreak_text = "\n".join([f"- {o['disease']} - {o['location']}\n  Precautions: {o['precautions']}" for o in outbreaks])
                    prompt = f"""Translate this outbreak information to {lang_name}:

Current Health Alerts:
{outbreak_text}

Keep it urgent but clear."""
                    
                    system_content = f"You are a health alert translator. Translate to {lang_name}."
                    
                    # Use unified AI call
                    ai_response = self._call_ai(
                        messages=[
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=400,
                        temperature=0.3
                    )
                    if ai_response:
                        return ai_response
                    
                    return "Please check official health department announcements."
            else:
                if language == 'en':
                    return "✅ No active disease outbreaks reported in your area. Continue following preventive measures!"
                else:
                    return "✅ No active disease outbreaks reported. Continue following preventive measures!"
                
        except Exception as e:
            logger.error(f"Outbreak query error: {str(e)}")
            if language == 'en':
                return "For outbreak information, please check official government health department announcements or call 104."
            else:
                return "Please check official health department announcements or call 104."
    
    async def _generate_general_health_response(self, message: str, language: str = 'en') -> str:
        """Generate general health education response"""
        try:
            # Language instructions - all 23 supported languages
            lang_names = {
                'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'te': 'Telugu',
                'mr': 'Marathi', 'ta': 'Tamil', 'ur': 'Urdu', 'gu': 'Gujarati',
                'kn': 'Kannada', 'ml': 'Malayalam', 'or': 'Odia', 'zh': 'Chinese',
                'es': 'Spanish', 'tl': 'Tagalog', 'ar': 'Arabic', 'fr': 'French',
                'de': 'German', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean',
                'pt': 'Portuguese', 'ru': 'Russian', 'tr': 'Turkish'
            }
            lang_name = lang_names.get(language, 'English')
            
            prompt = f"""You are a health education assistant for rural India. Answer this health question: '{message}'

IMPORTANT: Respond entirely in {lang_name} language.

Provide:
1. Clear, simple explanation
2. Practical advice
3. When to seek medical help
4. Prevention tips if applicable

Keep it friendly and easy to understand."""
            
            system_content = f"You are a helpful health education assistant for rural communities in India. Always respond in {lang_name} language."
            
            # Use unified AI call
            ai_response = self._call_ai(
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            if ai_response:
                return ai_response
            
            # If no AI available, use fallback
            return self._get_fallback_health_response(message, language)
            
        except Exception as e:
            logger.error(f"General health AI error: {str(e)}")
            return self._get_fallback_health_response(message, language)
    
    def _get_fallback_health_response(self, message: str = "", language: str = 'en') -> str:
        """Fallback health response with keyword matching"""
        message_lower = message.lower()
        
        # For non-English, return a generic message
        if language != 'en':
            return "Please consult a healthcare provider or call Health Helpline: 104 for health information."
        
        # Comprehensive health knowledge base
        health_responses = {
            "fever": "️ **Fever Information**\n\nFever is a temporary increase in body temperature, often due to an infection.\n\n**Common causes:**\n- Viral infections (cold, flu)\n- Bacterial infections\n- Heat exhaustion\n- Inflammatory conditions\n\n**What to do:**\n- Drink plenty of fluids\n- Get adequate rest\n- Take acetaminophen or ibuprofen for comfort\n- Use light clothing and blankets\n\n**⚠️ See a doctor if:**\n- Fever exceeds 103°F (39.4°C)\n- Lasts more than 3 days\n- Accompanied by severe headache, rash, or breathing difficulty\n\n**Emergency:** Call 108 for ambulance",
            
            "headache": " **Headache Information**\n\nHeadaches can be caused by stress, dehydration, lack of sleep, eye strain, or underlying conditions.\n\n**Common types:**\n- Tension headaches (most common)\n- Migraines\n- Cluster headaches\n- Sinus headaches\n\n**Self-care:**\n- Rest in a quiet, dark room\n- Stay hydrated\n- Apply cold or warm compress\n- Over-the-counter pain relievers\n- Practice relaxation techniques\n\n**⚠️ See a doctor if:**\n- Severe or sudden onset\n- Frequent headaches\n- Accompanied by vision changes, weakness, or confusion\n- After head injury",
            
            "cough": " **Cough Information**\n\nCoughing is your body's way of clearing irritants from your airways.\n\n**Types:**\n- Dry cough - no mucus\n- Wet/productive cough - with mucus\n- Chronic cough - lasts 8+ weeks\n\n**Common causes:**\n- Colds and flu\n- Allergies\n- Asthma\n- Acid reflux\n- Smoking\n\n**Remedies:**\n- Stay hydrated\n- Honey for adults (1-2 tsp)\n- Humidifier or steam\n- Avoid irritants (smoke, dust)\n- Over-the-counter cough medicines\n\n**⚠️ See a doctor if:**\n- Cough persists beyond 3 weeks\n- Produces blood or thick green mucus\n- Accompanied by high fever or breathing difficulty",
            
            "cold": " **Common Cold Information**\n\nThe common cold is a viral infection of your nose and throat.\n\n**Symptoms:**\n- Runny or stuffy nose\n- Sneezing\n- Sore throat\n- Mild cough\n- Mild fatigue\n- Low-grade fever\n\n**Treatment:**\n- Rest and sleep\n- Stay hydrated\n- Saline nasal spray\n- Over-the-counter cold medications\n- Warm salt water gargle\n\n**Prevention:**\n- Wash hands frequently\n- Avoid close contact with sick people\n- Don't touch your face\n- Clean frequently touched surfaces\n\n**Recovery:** Most colds resolve within 7-10 days.",
            
            "flu": " **Influenza (Flu) Information**\n\nFlu is a viral infection that attacks your respiratory system.\n\n**Symptoms:**\n- Sudden high fever\n- Chills and sweats\n- Muscle or body aches\n- Fatigue and weakness\n- Dry cough\n- Headache\n- Sore throat\n\n**Treatment:**\n- Rest and fluids\n- Antiviral medications (if within 48 hours)\n- Acetaminophen or ibuprofen for fever\n- Avoid contact with others\n\n**⚠️ Seek emergency care if:**\n- Difficulty breathing\n- Chest pain\n- Confusion\n- Severe weakness\n- Persistent vomiting\n\n**Prevention:** Annual flu vaccination is the best protection.",
            
            "diabetes": " **Diabetes Information**\n\nDiabetes is a chronic condition affecting how your body processes blood sugar (glucose).\n\n**Types:**\n- Type 1 - Body doesn't produce insulin\n- Type 2 - Body doesn't use insulin properly\n- Gestational - During pregnancy\n\n**Symptoms:**\n- Increased thirst and urination\n- Extreme hunger\n- Unexplained weight loss\n- Fatigue\n- Blurred vision\n- Slow-healing sores\n\n**Management:**\n- Monitor blood sugar regularly\n- Take medications as prescribed\n- Follow a healthy eating plan\n- Exercise regularly\n- Maintain healthy weight\n- Regular check-ups\n\n**⚠️ Complications can affect:** Heart, kidneys, eyes, nerves. Regular monitoring is essential.",
            
            "blood pressure": " **Blood Pressure Information**\n\nBlood pressure measures the force of blood against artery walls.\n\n**Categories:**\n- Normal: Below 120/80 mmHg\n- Elevated: 120-129/less than 80\n- High (Stage 1): 130-139/80-89\n- High (Stage 2): 140+/90+\n- Crisis: Over 180/120\n\n**Risk factors:**\n- Age, family history\n- Obesity\n- Lack of exercise\n- High salt intake\n- Smoking\n- Stress\n\n**Management:**\n- Reduce salt intake\n- Exercise regularly\n- Maintain healthy weight\n- Limit alcohol\n- Take prescribed medications\n- Manage stress\n\n**⚠️ Blood pressure crisis:** Call 108 immediately if over 180/120 with symptoms.",
            
            "covid": " **COVID-19 Information**\n\nCOVID-19 is a respiratory illness caused by the SARS-CoV-2 virus.\n\n**Common symptoms:**\n- Fever or chills\n- Cough\n- Shortness of breath\n- Fatigue\n- Muscle or body aches\n- Loss of taste or smell\n- Sore throat\n- Headache\n\n**What to do if infected:**\n- Isolate for 5-10 days\n- Rest and stay hydrated\n- Monitor oxygen levels\n- Take fever reducers\n- Contact doctor for high-risk cases\n\n**⚠️ Emergency warning signs:**\n- Difficulty breathing\n- Persistent chest pain\n- Confusion\n- Bluish lips or face\n\n**Prevention:** Vaccination, masks, hand hygiene, distancing.",
            
            "vaccination": " **Vaccination Information**\n\nVaccines help your immune system fight diseases by training it to recognize and combat pathogens.\n\n**Common vaccines:**\n- COVID-19\n- Influenza (annual)\n- MMR (Measles, Mumps, Rubella)\n- Tetanus/Diphtheria/Pertussis\n- Hepatitis A & B\n- Pneumonia\n- HPV\n\n**Benefits:**\n- Prevent serious diseases\n- Protect vulnerable populations\n- Reduce disease spread\n- Prevent complications\n\n**Safety:**\n- Vaccines are thoroughly tested\n- Side effects are usually mild\n- Benefits far outweigh risks\n\n**Consult your doctor** for personalized vaccination schedules based on age, health, and travel plans.",
            
            "pain": "⚡ **Pain Management Information**\n\nPain is your body's warning signal that something is wrong.\n\n**Types:**\n- Acute - Sudden, short-term\n- Chronic - Lasts 3+ months\n- Neuropathic - Nerve pain\n- Inflammatory - Swelling-related\n\n**Self-care:**\n- Rest the affected area\n- Ice for acute injuries (first 48 hours)\n- Heat for chronic pain\n- Over-the-counter pain relievers\n- Gentle stretching\n- Physical therapy\n\n**⚠️ See a doctor if:**\n- Severe or worsening pain\n- Pain after injury\n- Accompanied by fever, swelling, or numbness\n- Affects daily activities\n- Doesn't improve with self-care\n\n**Never ignore:** Chest pain, severe abdominal pain, or sudden severe headache.",
            
            "diet": " **Healthy Diet Information**\n\nA healthy diet provides essential nutrients and energy for your body.\n\n**Key components:**\n- Fruits and vegetables (5+ servings daily)\n- Whole grains (brown rice, whole wheat)\n- Lean proteins (fish, poultry, legumes)\n- Healthy fats (nuts, olive oil, avocado)\n- Dairy or alternatives\n\n**Limit:**\n- Processed foods\n- Added sugars\n- Excessive salt\n- Saturated and trans fats\n- Sugary drinks\n\n**Healthy habits:**\n- Eat regular meals\n- Control portion sizes\n- Stay hydrated (8 glasses water)\n- Read nutrition labels\n- Cook at home more often\n\n**Consult a nutritionist** for personalized dietary advice, especially for diabetes, heart disease, or weight management.",
            
            "exercise": """ **Exercise Information**

Regular physical activity is essential for overall health.

**Recommendations (adults):**
- 150 minutes moderate aerobic activity weekly, OR
- 75 minutes vigorous activity weekly
- Muscle-strengthening activities 2+ days/week

**Types of exercise:**
- Aerobic: Walking, running, swimming, cycling
- Strength: Weight lifting, resistance bands
- Flexibility: Stretching, yoga
- Balance: Tai chi, balance exercises

**Benefits:**
- Improves cardiovascular health
- Strengthens muscles and bones
- Helps maintain healthy weight
- Boosts mood and energy
- Improves sleep
- Reduces chronic disease risk

**Getting started:**
- Start slowly and gradually increase
- Choose activities you enjoy
- Set realistic goals
- Consult doctor if you have health conditions""",
            
            "sleep": " **Sleep Information**\n\nQuality sleep is essential for physical and mental health.\n\n**Recommended duration:**\n- Adults: 7-9 hours\n- Teenagers: 8-10 hours\n- Children: 9-12 hours\n\n**Sleep hygiene tips:**\n- Maintain consistent sleep schedule\n- Create a restful environment (dark, quiet, cool)\n- Limit screen time 1 hour before bed\n- Avoid caffeine after 2 PM\n- Don't eat large meals before bedtime\n- Exercise regularly (but not right before bed)\n- Practice relaxation techniques\n\n**Common sleep problems:**\n- Insomnia - difficulty falling/staying asleep\n- Sleep apnea - breathing interruptions\n- Restless leg syndrome\n\n**⚠️ See a doctor if:**\n- Persistent insomnia\n- Loud snoring with pauses\n- Excessive daytime sleepiness\n- Sleep affects daily functioning",
            
            "stress": " **Stress Management Information**\n\nStress is your body's response to pressure. Chronic stress can lead to health problems.\n\n**Physical signs:**\n- Headaches\n- Muscle tension\n- Fatigue\n- Sleep problems\n- Digestive issues\n- High blood pressure\n\n**Emotional signs:**\n- Anxiety\n- Irritability\n- Depression\n- Feeling overwhelmed\n\n**Management techniques:**\n- Deep breathing exercises\n- Meditation or mindfulness\n- Regular physical exercise\n- Adequate sleep\n- Social connections\n- Time management\n- Hobbies and relaxation\n- Limit caffeine and alcohol\n\n**⚠️ Seek professional help if:**\n- Stress interferes with daily life\n- Persistent anxiety or depression\n- Thoughts of self-harm\n- Physical symptoms worsen",
            
            "allergy": " **Allergy Information**\n\nAllergies occur when your immune system reacts to substances (allergens).\n\n**Common allergens:**\n- Pollen (hay fever)\n- Dust mites\n- Pet dander\n- Mold\n- Foods (nuts, shellfish, dairy)\n- Insect stings\n- Medications\n\n**Symptoms:**\n- Sneezing, runny nose\n- Itchy eyes, nose, throat\n- Watery eyes\n- Skin rash or hives\n- Swelling\n- Breathing difficulty (severe)\n\n**Management:**\n- Avoid known allergens\n- Antihistamines\n- Nasal corticosteroids\n- Decongestants\n- Allergy shots (immunotherapy)\n\n**⚠️ Emergency (Anaphylaxis):**\nCall 108 immediately for:\n- Difficulty breathing\n- Swelling of throat/tongue\n- Severe drop in blood pressure\n- Rapid pulse",
        }
        
        # Check for keywords in the message
        for keyword, response in health_responses.items():
            if keyword in message_lower:
                return response
        
        # Default comprehensive response
        return """ **Welcome to Your Health Assistant**

I can provide information on various health topics including:

**Common Symptoms:**
- Fever, headache, cough, cold
- Pain management
- Allergies

**Chronic Conditions:**
- Diabetes
- Blood pressure/hypertension
- Heart health

**General Health:**
- Diet and nutrition
- Exercise and fitness
- Sleep hygiene
- Stress management

**Preventive Care:**
- Vaccinations
- Regular check-ups
- Healthy lifestyle tips

**Emergency:** Call 108 for ambulance
**Health Helpline:** Call 104 for advice

What specific health topic would you like to know about?"""
    
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
