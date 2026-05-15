"""
Healthcare AI FastAPI Server (Local)
Rule-based system with medical knowledge
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import re
import uvicorn

app = FastAPI(title="Healthcare AI API", version="1.0.0")

# Load medical knowledge
print("🏥 Loading Healthcare AI Knowledge Base...")

with open('medical_data_combined.jsonl', 'r') as f:
    medical_data = [json.loads(line) for line in f]

# Build knowledge base
KNOWLEDGE_BASE = {}
SYMPTOM_INDEX = {}

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
            
            KNOWLEDGE_BASE[disease] = {
                'symptoms': symptoms,
                'treatment': treatment,
                'urgency': urgency,
                'full_response': output
            }
            
            # Index symptoms
            for symptom in symptoms:
                symptom_clean = symptom.lower().strip()
                if symptom_clean not in SYMPTOM_INDEX:
                    SYMPTOM_INDEX[symptom_clean] = []
                SYMPTOM_INDEX[symptom_clean].append(disease)

print(f"✅ Loaded {len(KNOWLEDGE_BASE)} conditions and {len(SYMPTOM_INDEX)} symptoms")

# Request/Response models
class SymptomRequest(BaseModel):
    symptoms: str
    user_id: Optional[str] = None

class ConditionInfo(BaseModel):
    condition: str
    matching_symptoms: List[str]
    treatment: str
    urgency: str

class HealthAnalysisResponse(BaseModel):
    possible_conditions: List[ConditionInfo]
    disclaimer: str

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    context: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    response: str
    type: str  # 'symptom_analysis', 'general', 'greeting'

def extract_symptoms(text):
    """Extract symptoms from user input with common term mapping"""
    text_lower = text.lower()
    found_symptoms = []
    
    # Common term mappings (user says -> actual symptom in database)
    keyword_mappings = {
        'fever': 'high_fever',
        'high temperature': 'high_fever',
        'temp': 'high_fever',
        'headache': 'headache',
        'head pain': 'headache',
        'cough': 'cough',
        'coughing': 'cough',
        'cold': 'cold',
        'runny nose': 'cold',
        'sneezing': 'cold',
        'sore throat': 'throat_irritation',
        'throat pain': 'throat_irritation',
        'stomach pain': 'stomach_pain',
        'belly ache': 'stomach_pain',
        'abdominal pain': 'stomach_pain',
        'chest pain': 'chest_pain',
        'breathing': 'breathlessness',
        'shortness of breath': 'breathlessness',
        'nausea': 'nausea',
        'feeling sick': 'nausea',
        'vomiting': 'vomiting',
        'throwing up': 'vomiting',
        'diarrhea': 'diarrhoea',
        'loose motion': 'diarrhoea',
        'fatigue': 'fatigue',
        'tired': 'fatigue',
        'weakness': 'fatigue',
        'dizziness': 'dizziness',
        'lightheaded': 'dizziness',
        'rash': 'skin_rash',
        'itching': 'itching',
        'itchy': 'itching',
        'joint pain': 'joint_pain',
        'muscle pain': 'muscle_pain',
        'back pain': 'back_pain',
        'eye pain': 'pain_behind_the_eyes',
        'blurred vision': 'blurred_and_distorted_vision',
        'yellow eyes': 'yellowish_skin',
        'yellow skin': 'yellowish_skin',
        'weight loss': 'weight_loss',
        'loss of appetite': 'loss_of_appetite',
        'not hungry': 'loss_of_appetite',
        'anxiety': 'anxiety',
        'depression': 'depression',
        'sweating': 'sweating',
        'excessive sweat': 'sweating',
        'dehydration': 'dehydration',
        'constipation': 'constipation',
        'indigestion': 'indigestion',
        'acidity': 'acidity',
        'ulcers': 'ulcers_on_tongue',
        'burning micturition': 'burning_micturition',
        'spotting urination': 'spotting_urination',
        'passage of gases': 'passage_of_gases',
        'internal itching': 'internal_itching',
        'toxic look': 'toxic_look_(typhos)',
        'swelled lymph nodes': 'swelled_lymph_nodes',
        'malaise': 'malaise',
        'bladder discomfort': 'bladder_discomfort',
        'foul smell of urine': 'foul_smell_ofurine',
        'continuous feel of urine': 'continuous_feel_of_urine',
        'skin peeling': 'skin_peeling',
        'silver like dusting': 'silver_like_dusting',
        'small dents in nails': 'small_dents_in_nails',
        'inflammatory nails': 'inflammatory_nails',
        'blister': 'blister',
        'red sore around nose': 'red_sore_around_nose',
        'yellow crust ooze': 'yellow_crust_ooze',
        'pus filled pimples': 'pus_filled_pimples',
        'blackheads': 'blackheads',
        'scurring': 'scurring',
    }
    
    # First check for keyword mappings
    for keyword, mapped_symptom in keyword_mappings.items():
        if keyword in text_lower and mapped_symptom in SYMPTOM_INDEX:
            if mapped_symptom not in found_symptoms:
                found_symptoms.append(mapped_symptom)
    
    # Also check for direct symptom matches
    for symptom in SYMPTOM_INDEX.keys():
        symptom_clean = symptom.replace('_', ' ').lower()
        if symptom_clean in text_lower or symptom in text_lower:
            if symptom not in found_symptoms:
                found_symptoms.append(symptom)
    
    return found_symptoms

def find_matching_diseases(symptoms):
    """Find diseases matching given symptoms"""
    matches = {}
    for symptom in symptoms:
        symptom_lower = symptom.lower()
        for known_symptom, diseases in SYMPTOM_INDEX.items():
            if symptom_lower in known_symptom or known_symptom in symptom_lower:
                for disease in diseases:
                    matches[disease] = matches.get(disease, 0) + 1
    
    # Sort by match count
    sorted_matches = sorted(matches.items(), key=lambda x: x[1], reverse=True)
    return sorted_matches

@app.get("/")
async def root():
    return {
        "message": "Healthcare AI API",
        "version": "1.0.0",
        "status": "running",
        "conditions_loaded": len(KNOWLEDGE_BASE),
        "symptoms_indexed": len(SYMPTOM_INDEX)
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "local-rule-based"}

@app.post("/analyze", response_model=HealthAnalysisResponse)
async def analyze_symptoms(request: SymptomRequest):
    """Analyze symptoms and return possible conditions"""
    symptoms = extract_symptoms(request.symptoms)
    
    if not symptoms:
        raise HTTPException(status_code=400, detail="No recognizable symptoms found")
    
    matches = find_matching_diseases(symptoms)
    
    conditions = []
    for disease, count in matches[:5]:  # Top 5 matches
        info = KNOWLEDGE_BASE[disease]
        conditions.append(ConditionInfo(
            condition=disease,
            matching_symptoms=info['symptoms'][:5],
            treatment=info['treatment'],
            urgency=info['urgency']
        ))
    
    return HealthAnalysisResponse(
        possible_conditions=conditions,
        disclaimer="This is not a medical diagnosis. Please consult a healthcare professional for proper evaluation and treatment."
    )

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint for healthcare AI"""
    user_input = request.message.lower()
    
    # Check for greetings
    if any(word in user_input for word in ['hello', 'hi', 'hey']):
        return ChatResponse(
            response="Hello! I'm your healthcare AI assistant. I can help you understand symptoms and provide general health information. What symptoms are you experiencing?",
            type="greeting"
        )
    
    # Check for thank you
    if any(word in user_input for word in ['thank', 'thanks']):
        return ChatResponse(
            response="You're welcome! Remember, I'm here to provide general information. For serious concerns, please consult a healthcare professional.",
            type="general"
        )
    
    # Extract and analyze symptoms
    symptoms = extract_symptoms(request.message)
    
    if symptoms:
        matches = find_matching_diseases(symptoms)
        
        if matches:
            response = f"Based on your symptoms ({', '.join(symptoms)}), here are some possibilities:\n\n"
            
            for disease, count in matches[:3]:
                info = KNOWLEDGE_BASE[disease]
                response += f"• **{disease}** (Urgency: {info['urgency']})\n"
                response += f"  - Treatment: {info['treatment']}\n\n"
            
            response += "⚠️ **Important**: This is not a diagnosis. Please consult a healthcare professional for proper evaluation."
            
            return ChatResponse(response=response, type="symptom_analysis")
        else:
            return ChatResponse(
                response=f"I see you mentioned: {', '.join(symptoms)}. While I don't have specific information about this combination, please monitor your symptoms and consult a healthcare professional if they persist or worsen.",
                type="general"
            )
    
    # Default response
    return ChatResponse(
        response="I'm here to help with health information! Please describe your symptoms (e.g., 'I have headache and fever') and I'll provide possible conditions and recommendations.",
        type="general"
    )

@app.get("/symptoms")
async def list_symptoms():
    """List all known symptoms"""
    return {"symptoms": list(SYMPTOM_INDEX.keys())}

@app.get("/conditions")
async def list_conditions():
    """List all known conditions"""
    return {"conditions": list(KNOWLEDGE_BASE.keys())}

if __name__ == "__main__":
    print("🚀 Starting Healthcare AI Server...")
    print("📡 API Documentation: http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001)
