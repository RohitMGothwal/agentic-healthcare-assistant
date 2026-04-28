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
                return self._get_fallback_health_response(message)
        
        # Default symptom response
        return """🩺 **Symptom Checker**

Based on your description, here are some general guidelines:

**Immediate Self-Care:**
• Rest and get adequate sleep
• Drink plenty of fluids (water, herbal tea)
• Monitor your symptoms
• Note when symptoms started

**Common Home Remedies:**
• **Fever**: Lukewarm sponging, light clothing
• **Cold**: Steam inhalation, saline gargle
• **Cough**: Honey (adults), warm fluids
• **Stomach issues**: ORS solution, bland diet
• **Headache**: Rest in dark room, hydration

**Track These Details:**
• Temperature (if fever)
• Duration of symptoms
• Severity (mild/moderate/severe)
• Any triggers or relief factors

⚠️ **Seek immediate medical care if:**
• High fever (>102°F/39°C) lasting >2 days
• Difficulty breathing or chest pain
• Severe headache with stiff neck
• Unconsciousness or confusion
• Severe dehydration (dry mouth, no urine)
• Symptoms worsen rapidly

📞 **Emergency:** Call 108 for ambulance
📞 **Health Helpline:** Call 104 for advice

*This is general guidance. Please consult a healthcare provider for proper diagnosis and treatment.*"""

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
                return self._get_fallback_health_response(message)
            
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
            return self._get_fallback_health_response(message)
    
    def _get_fallback_health_response(self, message: str = "") -> str:
        """Fallback health response with keyword matching"""
        message_lower = message.lower()
        
        # Comprehensive health knowledge base
        health_responses = {
            "fever": "🌡️ **Fever Information**\n\nFever is a temporary increase in body temperature, often due to an infection.\n\n**Common causes:**\n• Viral infections (cold, flu)\n• Bacterial infections\n• Heat exhaustion\n• Inflammatory conditions\n\n**What to do:**\n• Drink plenty of fluids\n• Get adequate rest\n• Take acetaminophen or ibuprofen for comfort\n• Use light clothing and blankets\n\n**⚠️ See a doctor if:**\n• Fever exceeds 103°F (39.4°C)\n• Lasts more than 3 days\n• Accompanied by severe headache, rash, or breathing difficulty\n\n**Emergency:** Call 108 for ambulance",
            
            "headache": "🤕 **Headache Information**\n\nHeadaches can be caused by stress, dehydration, lack of sleep, eye strain, or underlying conditions.\n\n**Common types:**\n• Tension headaches (most common)\n• Migraines\n• Cluster headaches\n• Sinus headaches\n\n**Self-care:**\n• Rest in a quiet, dark room\n• Stay hydrated\n• Apply cold or warm compress\n• Over-the-counter pain relievers\n• Practice relaxation techniques\n\n**⚠️ See a doctor if:**\n• Severe or sudden onset\n• Frequent headaches\n• Accompanied by vision changes, weakness, or confusion\n• After head injury",
            
            "cough": "🫁 **Cough Information**\n\nCoughing is your body's way of clearing irritants from your airways.\n\n**Types:**\n• Dry cough - no mucus\n• Wet/productive cough - with mucus\n• Chronic cough - lasts 8+ weeks\n\n**Common causes:**\n• Colds and flu\n• Allergies\n• Asthma\n• Acid reflux\n• Smoking\n\n**Remedies:**\n• Stay hydrated\n• Honey for adults (1-2 tsp)\n• Humidifier or steam\n• Avoid irritants (smoke, dust)\n• Over-the-counter cough medicines\n\n**⚠️ See a doctor if:**\n• Cough persists beyond 3 weeks\n• Produces blood or thick green mucus\n• Accompanied by high fever or breathing difficulty",
            
            "cold": "🤧 **Common Cold Information**\n\nThe common cold is a viral infection of your nose and throat.\n\n**Symptoms:**\n• Runny or stuffy nose\n• Sneezing\n• Sore throat\n• Mild cough\n• Mild fatigue\n• Low-grade fever\n\n**Treatment:**\n• Rest and sleep\n• Stay hydrated\n• Saline nasal spray\n• Over-the-counter cold medications\n• Warm salt water gargle\n\n**Prevention:**\n• Wash hands frequently\n• Avoid close contact with sick people\n• Don't touch your face\n• Clean frequently touched surfaces\n\n**Recovery:** Most colds resolve within 7-10 days.",
            
            "flu": "🦠 **Influenza (Flu) Information**\n\nFlu is a viral infection that attacks your respiratory system.\n\n**Symptoms:**\n• Sudden high fever\n• Chills and sweats\n• Muscle or body aches\n• Fatigue and weakness\n• Dry cough\n• Headache\n• Sore throat\n\n**Treatment:**\n• Rest and fluids\n• Antiviral medications (if within 48 hours)\n• Acetaminophen or ibuprofen for fever\n• Avoid contact with others\n\n**⚠️ Seek emergency care if:**\n• Difficulty breathing\n• Chest pain\n• Confusion\n• Severe weakness\n• Persistent vomiting\n\n**Prevention:** Annual flu vaccination is the best protection.",
            
            "diabetes": "🩺 **Diabetes Information**\n\nDiabetes is a chronic condition affecting how your body processes blood sugar (glucose).\n\n**Types:**\n• Type 1 - Body doesn't produce insulin\n• Type 2 - Body doesn't use insulin properly\n• Gestational - During pregnancy\n\n**Symptoms:**\n• Increased thirst and urination\n• Extreme hunger\n• Unexplained weight loss\n• Fatigue\n• Blurred vision\n• Slow-healing sores\n\n**Management:**\n• Monitor blood sugar regularly\n• Take medications as prescribed\n• Follow a healthy eating plan\n• Exercise regularly\n• Maintain healthy weight\n• Regular check-ups\n\n**⚠️ Complications can affect:** Heart, kidneys, eyes, nerves. Regular monitoring is essential.",
            
            "blood pressure": "💓 **Blood Pressure Information**\n\nBlood pressure measures the force of blood against artery walls.\n\n**Categories:**\n• Normal: Below 120/80 mmHg\n• Elevated: 120-129/less than 80\n• High (Stage 1): 130-139/80-89\n• High (Stage 2): 140+/90+\n• Crisis: Over 180/120\n\n**Risk factors:**\n• Age, family history\n• Obesity\n• Lack of exercise\n• High salt intake\n• Smoking\n• Stress\n\n**Management:**\n• Reduce salt intake\n• Exercise regularly\n• Maintain healthy weight\n• Limit alcohol\n• Take prescribed medications\n• Manage stress\n\n**⚠️ Blood pressure crisis:** Call 108 immediately if over 180/120 with symptoms.",
            
            "covid": "🦠 **COVID-19 Information**\n\nCOVID-19 is a respiratory illness caused by the SARS-CoV-2 virus.\n\n**Common symptoms:**\n• Fever or chills\n• Cough\n• Shortness of breath\n• Fatigue\n• Muscle or body aches\n• Loss of taste or smell\n• Sore throat\n• Headache\n\n**What to do if infected:**\n• Isolate for 5-10 days\n• Rest and stay hydrated\n• Monitor oxygen levels\n• Take fever reducers\n• Contact doctor for high-risk cases\n\n**⚠️ Emergency warning signs:**\n• Difficulty breathing\n• Persistent chest pain\n• Confusion\n• Bluish lips or face\n\n**Prevention:** Vaccination, masks, hand hygiene, distancing.",
            
            "vaccination": "💉 **Vaccination Information**\n\nVaccines help your immune system fight diseases by training it to recognize and combat pathogens.\n\n**Common vaccines:**\n• COVID-19\n• Influenza (annual)\n• MMR (Measles, Mumps, Rubella)\n• Tetanus/Diphtheria/Pertussis\n• Hepatitis A & B\n• Pneumonia\n• HPV\n\n**Benefits:**\n• Prevent serious diseases\n• Protect vulnerable populations\n• Reduce disease spread\n• Prevent complications\n\n**Safety:**\n• Vaccines are thoroughly tested\n• Side effects are usually mild\n• Benefits far outweigh risks\n\n**Consult your doctor** for personalized vaccination schedules based on age, health, and travel plans.",
            
            "pain": "⚡ **Pain Management Information**\n\nPain is your body's warning signal that something is wrong.\n\n**Types:**\n• Acute - Sudden, short-term\n• Chronic - Lasts 3+ months\n• Neuropathic - Nerve pain\n• Inflammatory - Swelling-related\n\n**Self-care:**\n• Rest the affected area\n• Ice for acute injuries (first 48 hours)\n• Heat for chronic pain\n• Over-the-counter pain relievers\n• Gentle stretching\n• Physical therapy\n\n**⚠️ See a doctor if:**\n• Severe or worsening pain\n• Pain after injury\n• Accompanied by fever, swelling, or numbness\n• Affects daily activities\n• Doesn't improve with self-care\n\n**Never ignore:** Chest pain, severe abdominal pain, or sudden severe headache.",
            
            "diet": "🥗 **Healthy Diet Information**\n\nA healthy diet provides essential nutrients and energy for your body.\n\n**Key components:**\n• Fruits and vegetables (5+ servings daily)\n• Whole grains (brown rice, whole wheat)\n• Lean proteins (fish, poultry, legumes)\n• Healthy fats (nuts, olive oil, avocado)\n• Dairy or alternatives\n\n**Limit:**\n• Processed foods\n• Added sugars\n• Excessive salt\n• Saturated and trans fats\n• Sugary drinks\n\n**Healthy habits:**\n• Eat regular meals\n• Control portion sizes\n• Stay hydrated (8 glasses water)\n• Read nutrition labels\n• Cook at home more often\n\n**Consult a nutritionist** for personalized dietary advice, especially for diabetes, heart disease, or weight management.",
            
            "exercise": "🏃 **Exercise Information**\n\nRegular physical activity is essential for overall health.\n\n**Recommendations (adults):**
• 150 minutes moderate aerobic activity weekly, OR
• 75 minutes vigorous activity weekly\n• Muscle-strengthening activities 2+ days/week\n\n**Types of exercise:**\n• Aerobic: Walking, running, swimming, cycling\n• Strength: Weight lifting, resistance bands\n• Flexibility: Stretching, yoga\n• Balance: Tai chi, balance exercises\n\n**Benefits:**\n• Improves cardiovascular health\n• Strengthens muscles and bones\n• Helps maintain healthy weight\n• Boosts mood and energy\n• Improves sleep\n• Reduces chronic disease risk\n\n**Getting started:**\n• Start slowly and gradually increase\n• Choose activities you enjoy\n• Set realistic goals\n• Consult doctor if you have health conditions",
            
            "sleep": "😴 **Sleep Information**\n\nQuality sleep is essential for physical and mental health.\n\n**Recommended duration:**\n• Adults: 7-9 hours\n• Teenagers: 8-10 hours\n• Children: 9-12 hours\n\n**Sleep hygiene tips:**\n• Maintain consistent sleep schedule\n• Create a restful environment (dark, quiet, cool)\n• Limit screen time 1 hour before bed\n• Avoid caffeine after 2 PM\n• Don't eat large meals before bedtime\n• Exercise regularly (but not right before bed)\n• Practice relaxation techniques\n\n**Common sleep problems:**\n• Insomnia - difficulty falling/staying asleep\n• Sleep apnea - breathing interruptions\n• Restless leg syndrome\n\n**⚠️ See a doctor if:**\n• Persistent insomnia\n• Loud snoring with pauses\n• Excessive daytime sleepiness\n• Sleep affects daily functioning",
            
            "stress": "🧘 **Stress Management Information**\n\nStress is your body's response to pressure. Chronic stress can lead to health problems.\n\n**Physical signs:**\n• Headaches\n• Muscle tension\n• Fatigue\n• Sleep problems\n• Digestive issues\n• High blood pressure\n\n**Emotional signs:**\n• Anxiety\n• Irritability\n• Depression\n• Feeling overwhelmed\n\n**Management techniques:**\n• Deep breathing exercises\n• Meditation or mindfulness\n• Regular physical exercise\n• Adequate sleep\n• Social connections\n• Time management\n• Hobbies and relaxation\n• Limit caffeine and alcohol\n\n**⚠️ Seek professional help if:**\n• Stress interferes with daily life\n• Persistent anxiety or depression\n• Thoughts of self-harm\n• Physical symptoms worsen",
            
            "allergy": "🤧 **Allergy Information**\n\nAllergies occur when your immune system reacts to substances (allergens).\n\n**Common allergens:**\n• Pollen (hay fever)\n• Dust mites\n• Pet dander\n• Mold\n• Foods (nuts, shellfish, dairy)\n• Insect stings\n• Medications\n\n**Symptoms:**\n• Sneezing, runny nose\n• Itchy eyes, nose, throat\n• Watery eyes\n• Skin rash or hives\n• Swelling\n• Breathing difficulty (severe)\n\n**Management:**\n• Avoid known allergens\n• Antihistamines\n• Nasal corticosteroids\n• Decongestants\n• Allergy shots (immunotherapy)\n\n**⚠️ Emergency (Anaphylaxis):**\nCall 108 immediately for:\n• Difficulty breathing\n• Swelling of throat/tongue\n• Severe drop in blood pressure\n• Rapid pulse",
        }
        
        # Check for keywords in the message
        for keyword, response in health_responses.items():
            if keyword in message_lower:
                return response
        
        # Default comprehensive response
        return """🏥 **Welcome to Your Health Assistant**

I can provide information on various health topics including:

**Common Symptoms:**
• Fever, headache, cough, cold
• Pain management
• Allergies

**Chronic Conditions:**
• Diabetes
• Blood pressure/hypertension
• Heart health

**General Health:**
• Diet and nutrition
• Exercise and fitness
• Sleep hygiene
• Stress management

**Preventive Care:**
• Vaccinations
• Regular check-ups
• Healthy lifestyle tips

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
