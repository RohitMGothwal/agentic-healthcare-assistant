"""
Generate Medical Training Data
Helper script to create medical dataset
"""

import json

# Template for medical conversations
medical_templates = [
    {
        "symptoms": "headache and fever",
        "age": "adult",
        "response": """Based on your symptoms of headache and fever, this could indicate a viral infection such as the flu or a common cold. Other possibilities include a sinus infection or tension headache with coincidental fever.

**Recommendations:**
- Rest and stay well-hydrated
- Take acetaminophen or ibuprofen for fever and pain
- Apply cool compress to forehead
- Monitor temperature every 4-6 hours

**When to see a doctor:**
- Fever exceeds 103°F (39.4°C)
- Severe headache with stiff neck
- Symptoms persist beyond 5 days
- Confusion or altered consciousness

**Suggested Specialist:** General Practitioner

**Disclaimer:** This is not medical advice. Please consult a healthcare professional for proper evaluation."""
    },
    {
        "symptoms": "chest pain and shortness of breath",
        "age": "adult",
        "response": """**⚠️ URGENT:** Chest pain with shortness of breath requires immediate medical attention. This could indicate a serious condition such as heart attack, pulmonary embolism, or severe asthma attack.

**Immediate Actions:**
- Call emergency services (911) if severe
- Stop all activity and rest
- Do not drive yourself
- Keep calm and sit upright

**Possible Serious Causes:**
- Heart attack or angina
- Pulmonary embolism
- Pneumothorax (collapsed lung)
- Severe pneumonia

**Suggested Specialist:** Emergency Medicine / Cardiologist

**Disclaimer:** This is a potentially life-threatening situation. Seek emergency medical care immediately."""
    },
    {
        "symptoms": "stomach pain and nausea",
        "age": "adult",
        "response": """Abdominal pain with nausea can have many causes ranging from mild to serious.

**Common Causes:**
- Gastroenteritis (stomach flu)
- Food poisoning
- Gastritis or acid reflux
- Appendicitis (if pain is in lower right)
- Gallbladder issues (if upper right pain)

**Self-Care:**
- Clear liquids only for first 24 hours
- BRAT diet (bananas, rice, applesauce, toast)
- Avoid alcohol, caffeine, and fatty foods
- Rest

**Red Flags - See Doctor Immediately:**
- Severe or worsening pain
- Pain localized to lower right abdomen
- Blood in vomit or stool
- High fever
- Inability to keep fluids down

**Suggested Specialist:** General Practitioner or Gastroenterologist

**Disclaimer:** This is not medical advice. Seek professional evaluation for persistent symptoms."""
    },
]

def generate_dataset():
    """Generate medical training dataset"""
    
    dataset = []
    
    for template in medical_templates:
        entry = {
            "instruction": f"I have {template['symptoms']}",
            "output": template['response']
        }
        dataset.append(entry)
    
    # Write to file
    with open("medical_data.jsonl", "w") as f:
        for entry in dataset:
            f.write(json.dumps(entry) + "\n")
    
    print(f"✅ Generated {len(dataset)} training examples")
    print("📁 Saved to: medical_data.jsonl")
    print("\nNext steps:")
    print("1. Review and expand the dataset with more examples")
    print("2. Run: python train_healthcare_model.py")

if __name__ == "__main__":
    generate_dataset()
