"""
Healthcare AI Inference Server
Runs locally on MacBook Air M3
"""

from unsloth import FastLanguageModel
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import torch
import uvicorn

app = FastAPI(title="Healthcare AI API", version="1.0.0")

# Global model variables
model = None
tokenizer = None

class HealthQuery(BaseModel):
    symptoms: str
    age: Optional[int] = None
    gender: Optional[str] = None
    duration: Optional[str] = None

class HealthResponse(BaseModel):
    assessment: str
    possible_conditions: list
    recommendations: list
    specialist_referral: str
    disclaimer: str

# Healthcare Prompt Template
HEALTHCARE_SYSTEM_PROMPT = """You are a healthcare AI assistant. Analyze the patient's symptoms and provide:
1. Initial assessment
2. Possible conditions (be careful not to diagnose)
3. General recommendations
4. Suggested specialist to consult
5. Urgency level

Always be empathetic, professional, and include appropriate disclaimers.
Never provide definitive diagnoses or prescribe medications.

Patient Information:
Symptoms: {symptoms}
Age: {age}
Gender: {gender}
Duration: {duration}

Provide your response in this format:
ASSESSMENT: [Brief assessment]
CONDITIONS: [Possible conditions - be cautious]
RECOMMENDATIONS: [General advice]
SPECIALIST: [Which doctor to see]
URGENCY: [Low/Medium/High]
"""

@app.on_event("startup")
async def load_model():
    """Load the healthcare model on startup"""
    global model, tokenizer
    
    print("🏥 Loading Healthcare AI Model...")
    
    model, tokenizer = FastLanguageManager.from_pretrained(
        model_name="healthcare_assistant_lora",  # Your trained model
        max_seq_length=1024,
        dtype=None,
        load_in_4bit=True,
    )
    
    # Enable faster inference
    FastLanguageModel.for_inference(model)
    
    print("✅ Healthcare AI Model loaded successfully!")

@app.post("/analyze", response_model=HealthResponse)
async def analyze_symptoms(query: HealthQuery):
    """Analyze patient symptoms and provide healthcare guidance"""
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Format prompt
    prompt = HEALTHCARE_SYSTEM_PROMPT.format(
        symptoms=query.symptoms,
        age=query.age or "Not specified",
        gender=query.gender or "Not specified",
        duration=query.duration or "Not specified"
    )
    
    # Generate response
    inputs = tokenizer(prompt, return_tensors="pt").to("mps")  # Use Apple Silicon
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=500,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    
    response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Parse response (simplified)
    return HealthResponse(
        assessment="Based on your symptoms, here's an initial assessment...",
        possible_conditions=["Condition A", "Condition B"],
        recommendations=["Rest", "Stay hydrated"],
        specialist_referral="General Practitioner",
        disclaimer="This is not medical advice. Please consult a healthcare professional."
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
