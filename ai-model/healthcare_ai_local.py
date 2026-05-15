"""
Local Healthcare AI - Works Immediately!
Rule-based system with medical knowledge
"""

import json
import re
from difflib import get_close_matches

print("🏥 Healthcare AI Assistant (Local)")
print("=" * 50)
print("✅ Ready immediately - no downloads needed!")
print()

# Load medical knowledge
with open('medical_data_combined.jsonl', 'r') as f:
    medical_data = [json.loads(line) for line in f]

# Build knowledge base from the training data format
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
            
            KNOWLEDGE_BASE[disease] = {
                'symptoms': symptoms,
                'treatment': treatment,
                'full_response': output
            }
            
            # Index symptoms
            for symptom in symptoms:
                symptom_clean = symptom.lower().strip()
                if symptom_clean not in SYMPTOM_INDEX:
                    SYMPTOM_INDEX[symptom_clean] = []
                SYMPTOM_INDEX[symptom_clean].append(disease)

# Additional medical knowledge
GENERAL_ADVICE = {
    'fever': "Fever is often a sign of infection. Rest, stay hydrated, and monitor temperature. Seek medical attention if fever exceeds 103°F (39.4°C) or lasts more than 3 days.",
    'headache': "Headaches can be caused by stress, dehydration, or tension. Try rest, hydration, and over-the-counter pain relievers. Seek care for severe or sudden headaches.",
    'cough': "Coughs can indicate colds, flu, or allergies. Stay hydrated and consider honey for soothing. See a doctor if cough persists more than 2 weeks or includes blood.",
    'pain': "Pain is your body's signal that something needs attention. Rest the affected area and consider appropriate pain relief. Seek medical care for severe or persistent pain.",
    'nausea': "Nausea can result from various causes including food issues, motion sickness, or infections. Stay hydrated with small sips of clear fluids. Seek care if severe.",
    'fatigue': "Fatigue can be caused by poor sleep, stress, anemia, or underlying conditions. Ensure adequate rest and nutrition. Consult a doctor if persistent.",
    'dizziness': "Dizziness may indicate dehydration, low blood pressure, or inner ear issues. Sit or lie down to prevent falls. Seek immediate care if accompanied by chest pain or severe headache.",
}

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

def extract_symptoms(text):
    """Extract symptoms from user input"""
    text_lower = text.lower()
    found_symptoms = []
    
    # Clean the text - remove common words
    text_clean = text_lower.replace('i have', '').replace('i am', '').replace('my', '').replace('and', ',')
    
    for symptom in SYMPTOM_INDEX.keys():
        # Clean symptom for matching
        symptom_clean = symptom.replace('_', ' ').lower()
        if symptom_clean in text_lower or symptom in text_lower:
            found_symptoms.append(symptom)
    
    return found_symptoms

def generate_response(user_input):
    """Generate healthcare response"""
    user_lower = user_input.lower()
    
    # Check for greetings
    if any(word in user_lower for word in ['hello', 'hi', 'hey']):
        return "Hello! I'm your healthcare AI assistant. I can help you understand symptoms and provide general health information. What symptoms are you experiencing?"
    
    # Check for thank you
    if any(word in user_lower for word in ['thank', 'thanks']):
        return "You're welcome! Remember, I'm here to provide general information. For serious concerns, please consult a healthcare professional."
    
    # Extract symptoms
    symptoms = extract_symptoms(user_input)
    
    if symptoms:
        # Find matching diseases
        matches = find_matching_diseases(symptoms)
        
        if matches:
            response = f"Based on your symptoms ({', '.join(symptoms)}), here are some possibilities:\n\n"
            
            for disease, count in matches[:3]:  # Top 3 matches
                info = KNOWLEDGE_BASE[disease]
                response += f"• **{disease}**\n"
                response += f"  - Matching symptoms: {', '.join(info['symptoms'][:5])}\n"
                response += f"  - Treatment: {info['treatment']}\n\n"
            
            response += "⚠️ **Important**: This is not a diagnosis. Please consult a healthcare professional for proper evaluation."
            return response
        else:
            return f"I see you mentioned: {', '.join(symptoms)}. While I don't have specific information about this combination, please monitor your symptoms and consult a healthcare professional if they persist or worsen."
    
    # Check for general symptom advice
    for keyword, advice in GENERAL_ADVICE.items():
        if keyword in user_lower:
            return f"**About {keyword.capitalize()}:**\n{advice}\n\n⚠️ This is general information. Please consult a healthcare professional for personalized advice."
    
    # Default response
    return """I'm here to help with health information! You can ask me about:

• Specific symptoms (e.g., "I have fever and headache")
• General health advice
• Possible conditions based on symptoms

Please describe your symptoms or health concern, and I'll do my best to assist you.

⚠️ **Disclaimer**: I provide general health information only. Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment."""

# Interactive loop
print("🤖 AI: Hello! I'm your healthcare assistant. What symptoms are you experiencing?")
print("   (Type 'quit' to exit)")
print()

while True:
    user_input = input("🤒 You: ").strip()
    
    if user_input.lower() in ['quit', 'exit', 'q']:
        print("\n👋 AI: Take care! Stay healthy!")
        break
    
    if user_input:
        response = generate_response(user_input)
        print(f"\n🏥 AI: {response}\n")
