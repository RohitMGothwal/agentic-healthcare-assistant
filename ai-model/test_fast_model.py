"""
Healthcare AI Inference Script
Test your trained model
"""

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

print("🏥 Healthcare AI Assistant")
print("=" * 50)

# Load model
model_path = "healthcare_assistant_fast"
print(f"📥 Loading model from {model_path}...")

model = AutoModelForCausalLM.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Set device
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
model = model.to(device)

print("✅ Model loaded! Ready for healthcare queries.")
print("\nType your health questions (or 'quit' to exit):")

HEALTHCARE_PROMPT = """### Instruction:
You are a helpful healthcare assistant. Provide accurate, empathetic health information.
Always include a disclaimer that this is not medical advice.
Be concise and professional.

User Query: {}

### Response:
"""

while True:
    user_input = input("\n🤒 Your question: ")
    
    if user_input.lower() in ['quit', 'exit', 'q']:
        print("👋 Goodbye! Stay healthy!")
        break
    
    # Format prompt
    prompt = HEALTHCARE_PROMPT.format(user_input)
    
    # Generate response
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
    
    # Decode response
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract only the response part
    if "### Response:" in response:
        response = response.split("### Response:")[-1].strip()
    
    print(f"\n🏥 AI Response: {response}")
