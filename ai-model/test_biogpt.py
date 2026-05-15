"""
Healthcare AI using Microsoft BioGPT
Pre-trained on medical papers - no training needed!
"""

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

print("🏥 Healthcare AI Assistant (BioGPT)")
print("=" * 50)

# BioGPT model - pre-trained on medical papers
MODEL_NAME = "microsoft/BioGPT"

print(f"📥 Loading {MODEL_NAME}...")
print("   (This may take a minute on first run)")

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"
)

print("✅ BioGPT loaded! Ready for healthcare queries.")
print("\nType your health questions (or 'quit' to exit):")

def generate_response(question):
    """Generate healthcare response using BioGPT"""
    # Format the prompt
    prompt = f"Question: {question}\nAnswer:"
    
    # Tokenize
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    # Generate
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            num_return_sequences=1
        )
    
    # Decode
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract answer part
    if "Answer:" in response:
        response = response.split("Answer:")[-1].strip()
    
    return response

# Interactive loop
while True:
    user_input = input("\n🤒 Your question: ")
    
    if user_input.lower() in ['quit', 'exit', 'q']:
        print("👋 Goodbye! Stay healthy!")
        break
    
    print("\n🏥 AI is thinking...")
    response = generate_response(user_input)
    
    # Add medical disclaimer
    print(f"\n🏥 AI Response:\n{response}")
    print("\n⚠️  Disclaimer: This is not medical advice. Please consult a healthcare professional for medical concerns.")
