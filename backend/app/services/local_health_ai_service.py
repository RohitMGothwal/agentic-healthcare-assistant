"""
Local Healthcare AI Service
Connects to the local rule-based AI server running on port 8001
"""

import requests
import logging
from typing import Dict, List, Optional
import json
import re

logger = logging.getLogger(__name__)

class LocalHealthAIService:
    """
    Service to connect to the local rule-based Healthcare AI
    """
    
    def __init__(self, base_url: str = "http://172.28.9.9:8001"):
        self.base_url = base_url
        self.timeout = 10
        
        # Load medical knowledge locally as fallback
        self._load_local_knowledge()
    
    def _load_local_knowledge(self):
        """Load medical knowledge from local file"""
        try:
            import os
            # Try multiple possible paths
            possible_paths = [
                os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ai-model', 'medical_data_combined.jsonl'),
                os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'ai-model', 'medical_data_combined.jsonl'),
                '/Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant/ai-model/medical_data_combined.jsonl',
                'ai-model/medical_data_combined.jsonl',
                '../ai-model/medical_data_combined.jsonl',
            ]
            
            data_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    data_path = path
                    break
            
            if not data_path:
                logger.error("Could not find medical_data_combined.jsonl in any known location")
                self.knowledge_base = {}
                self.symptom_index = {}
                return
            
            logger.info(f"Loading medical data from: {data_path}")
            with open(data_path, 'r') as f:
                medical_data = [json.loads(line) for line in f]
            
            self.knowledge_base = {}
            self.symptom_index = {}
            
            for item in medical_data:
                instruction = item['instruction']
                output = item['output']
                
                # Extract disease from output
                disease_match = re.search(r'you may have \*\*(.+?)\*\*', output)
                if disease_match:
                    disease = disease_match.group(1)
                    
                    # Extract symptoms from instruction
                    symptom_match = re.search(r'I have (.+)\. What could this be\?', instruction)
                    if symptom_match:
                        symptoms_text = symptom_match.group(1)
                        symptoms = [s.strip() for s in symptoms_text.split(',')]
                        
                        # Extract treatment/precautions from output
                        treatment_match = re.search(r'\*\*Precautions:\*\*\n- (.+?)(?:\n\n|\Z)', output, re.DOTALL)
                        treatment = treatment_match.group(1).replace('\n- ', ', ') if treatment_match else 'Consult a healthcare professional'
                        
                        # Extract urgency
                        urgency_match = re.search(r'\*\*Urgency Level:\*\* (\w+)', output)
                        urgency = urgency_match.group(1) if urgency_match else 'Medium'
                        
                        self.knowledge_base[disease] = {
                            'symptoms': symptoms,
                            'treatment': treatment,
                            'urgency': urgency,
                            'full_response': output
                        }
                        
                        # Index symptoms
                        for symptom in symptoms:
                            symptom_clean = symptom.lower().strip()
                            if symptom_clean not in self.symptom_index:
                                self.symptom_index[symptom_clean] = []
                            self.symptom_index[symptom_clean].append(disease)
            
            logger.info(f"Loaded {len(self.knowledge_base)} conditions locally")
            
        except Exception as e:
            logger.error(f"Error loading local knowledge: {e}")
            self.knowledge_base = {}
            self.symptom_index = {}
    
    def _extract_symptoms(self, text: str) -> List[str]:
        """Extract symptoms from user input with comprehensive matching"""
        text_lower = text.lower()
        found_symptoms = []
        
        # Direct keyword to database symptom mappings
        keyword_to_symptom = {
            'fever': 'high_fever',
            'headache': 'headache',
            'cough': 'cough',
            'chest pain': 'chest_pain',
            'stomach pain': 'abdominal_pain',
            'abdominal pain': 'abdominal_pain',
            'muscle pain': 'muscle_pain',
            'joint pain': 'joint_pain',
            'tired': 'fatigue',
            'fatigue': 'fatigue',
            'nausea': 'nausea',
            'vomiting': 'vomiting',
            'dizzy': 'dizziness',
            'dizziness': 'dizziness',
            'breath': 'breathlessness',
            'shortness of breath': 'breathlessness',
            'rash': 'skin_rash',
            'skin rash': 'skin_rash',
            'cold': 'chills',
            'chills': 'chills',
            'shivering': 'shivering',
            'sweating': 'sweating',
            'itching': 'itching',
            'throat': 'patches_in_throat',
            'balance': 'loss_of_balance',
            'weight loss': 'weight_loss',
            'diarrhea': 'diarrhoea',
            'diarrhoea': 'diarrhoea',
            'constipation': 'constipation',
            'dehydration': 'dehydration',
            'yellow eyes': 'yellowing_of_eyes',
            'yellow skin': 'yellowish_skin',
        }
        
        # Check for multi-word matches first (longer phrases)
        for phrase, symptom in sorted(keyword_to_symptom.items(), key=lambda x: -len(x[0])):
            if phrase in text_lower:
                if symptom in self.symptom_index and symptom not in found_symptoms:
                    found_symptoms.append(symptom)
        
        # Check for single word matches
        words = text_lower.split()
        for word in words:
            word = word.strip('.,!?;:')
            if word in keyword_to_symptom:
                symptom = keyword_to_symptom[word]
                if symptom in self.symptom_index and symptom not in found_symptoms:
                    found_symptoms.append(symptom)
        
        # Direct database symptom matching - only exact matches
        for symptom in self.symptom_index.keys():
            if symptom in found_symptoms:
                continue
            symptom_clean = symptom.replace('_', ' ').lower()
            # Only match if the full symptom name is in text
            if symptom_clean in text_lower:
                found_symptoms.append(symptom)
        
        return found_symptoms
    
    def _find_matching_diseases(self, symptoms: List[str]) -> List[tuple]:
        """Find diseases matching given symptoms"""
        matches = {}
        for symptom in symptoms:
            symptom_lower = symptom.lower()
            for known_symptom, diseases in self.symptom_index.items():
                if symptom_lower in known_symptom or known_symptom in symptom_lower:
                    for disease in diseases:
                        matches[disease] = matches.get(disease, 0) + 1
        
        # Sort by match count
        sorted_matches = sorted(matches.items(), key=lambda x: x[1], reverse=True)
        return sorted_matches
    
    def is_available(self) -> bool:
        """Check if local AI server is running"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    async def analyze_symptoms(self, symptoms: str) -> Optional[Dict]:
        """Analyze symptoms using local AI"""
        try:
            # Try to connect to local server first
            if self.is_available():
                response = requests.post(
                    f"{self.base_url}/analyze",
                    json={"symptoms": symptoms},
                    timeout=self.timeout
                )
                if response.status_code == 200:
                    return response.json()
            
            # Fallback to local processing
            return self._analyze_locally(symptoms)
            
        except Exception as e:
            logger.error(f"Error analyzing symptoms: {e}")
            return self._analyze_locally(symptoms)
    
    def _analyze_locally(self, symptoms_text: str) -> Dict:
        """Analyze symptoms using local knowledge base"""
        symptoms = self._extract_symptoms(symptoms_text)
        
        if not symptoms:
            return {
                "possible_conditions": [],
                "disclaimer": "No recognizable symptoms found. Please consult a healthcare professional."
            }
        
        matches = self._find_matching_diseases(symptoms)
        
        conditions = []
        for disease, count in matches[:5]:
            info = self.knowledge_base[disease]
            conditions.append({
                "condition": disease,
                "matching_symptoms": info['symptoms'][:5],
                "treatment": info['treatment'],
                "urgency": info['urgency']
            })
        
        return {
            "possible_conditions": conditions,
            "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional for proper evaluation and treatment."
        }
    
    async def chat(self, message: str) -> Dict:
        """Chat with local AI"""
        try:
            # Try to connect to local server first
            if self.is_available():
                response = requests.post(
                    f"{self.base_url}/chat",
                    json={"message": message},
                    timeout=self.timeout
                )
                if response.status_code == 200:
                    return response.json()
            
            # Fallback to local processing
            return self._chat_locally(message)
            
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return self._chat_locally(message)
    
    def _chat_locally(self, message: str) -> Dict:
        """Process chat message locally"""
        user_lower = message.lower()
        logger.info(f"Processing message: {message}")
        
        # Check for greetings
        if any(word in user_lower for word in ['hello', 'hi', 'hey']):
            return {
                "response": "Hello! I'm your healthcare AI assistant. I can help you understand symptoms and provide general health information. What symptoms are you experiencing?",
                "type": "greeting"
            }
        
        # Check for thank you
        if any(word in user_lower for word in ['thank', 'thanks']):
            return {
                "response": "You're welcome! Remember, I'm here to provide general information. For serious concerns, please consult a healthcare professional.",
                "type": "general"
            }
        
        # Extract and analyze symptoms
        symptoms = self._extract_symptoms(message)
        logger.info(f"Extracted symptoms: {symptoms}")
        
        if symptoms:
            matches = self._find_matching_diseases(symptoms)
            logger.info(f"Found matches: {matches}")
            
            if matches:
                response = f"Based on your symptoms ({', '.join(symptoms)}), here are some possibilities:\n\n"
                
                for disease, count in matches[:3]:
                    info = self.knowledge_base[disease]
                    response += f"• **{disease}** (Urgency: {info['urgency']})\n"
                    response += f"  - Treatment: {info['treatment']}\n\n"
                
                response += "⚠️ **Important**: This is not a diagnosis. Please consult a healthcare professional for proper evaluation."
                
                return {"response": response, "type": "symptom_analysis"}
            else:
                return {
                    "response": f"I see you mentioned: {', '.join(symptoms)}. While I don't have specific information about this combination, please monitor your symptoms and consult a healthcare professional if they persist or worsen.",
                    "type": "general"
                }
        
        # Check for symptom keywords even if not in database
        symptom_keywords = ['fever', 'headache', 'cough', 'pain', 'cold', 'tired', 'nausea', 'dizzy', 'rash', 'sick', 'hurt', 'ache']
        has_symptoms = any(keyword in user_lower for keyword in symptom_keywords)
        
        if has_symptoms:
            return {
                "response": "I understand you're not feeling well. Based on your description, I'd recommend:\n\n• Monitor your symptoms\n• Stay hydrated and rest\n• Take over-the-counter medications if appropriate\n• Consult a healthcare professional if symptoms worsen or persist\n\n⚠️ **Important**: For severe symptoms (chest pain, difficulty breathing, high fever), seek immediate medical attention.",
                "type": "general"
            }
        
        # Default response
        return {
            "response": "I'm here to help with health information! Please describe your symptoms (e.g., 'I have headache and fever') and I'll provide possible conditions and recommendations.",
            "type": "general"
        }

# Singleton instance
local_health_ai = LocalHealthAIService()
