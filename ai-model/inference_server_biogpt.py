"""
Healthcare AI Inference Server using BioGPT
Pre-trained medical model - no training required!
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import uvicorn

app = FastAPI(title="Healthcare AI API", version="1.0.0")

# Load BioGPT model
print("🏥 Loading BioGPT Healthcare AI...")
MODEL_NAME = "microsoft/BioGPT"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"
)

print("✅ BioGPT loaded and ready!")

class HealthQuery(BaseModel):
    query: str
    language: str = "en"

class HealthResponse(BaseModel):
    response: str
    disclaimer: str = "This is not medical advice. Please consult a healthcare professional."
    model: str = "microsoft/BioGPT"

def generate_medical_response(question: str) -> str:
    """Generate healthcare response using BioGPT"""
    prompt = f"Question: {question}\nAnswer:"
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    if "Answer:" in response:
        response = response.split("Answer:")[-1].strip()
    
    return response

@app.post("/analyze", response_model=HealthResponse)
async def analyze_health(query: HealthQuery):
    """Analyze health query using BioGPT"""
    try:
        response_text = generate_medical_response(query.query)
        return HealthResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model": MODEL_NAME}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Healthcare AI API using BioGPT",
        "model": MODEL_NAME,
        "endpoints": {
            "POST /analyze": "Analyze health query",
            "GET /health": "Health check"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting Healthcare AI Server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
