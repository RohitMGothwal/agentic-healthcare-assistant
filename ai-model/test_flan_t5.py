"""
Healthcare AI using FLAN-T5
Pre-trained for question answering - works immediately!
"""

from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

print("🏥 Healthcare AI Assistant (FLAN-T5)")
print("=" * 50)

# FLAN-T5 - pre-trained for instruction following
MODEL_NAME = "google/flan-t5-base"  # 248M parameters, good balance

print(f"📥 Loading {MODEL_NAME}...")
print("   (Smaller and faster than BioGPT)")

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float32,
)

device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
model = model.to(device)

print("✅ FLAN-T5 loaded! Ready for healthcare queries.")
print("\nType your health questions (or 'quit' to exit):")

def generate_response(question):
    """Generate healthcare response using FLAN-T5"""
    # Format as instruction
    prompt = f"Answer this medical question: {question}"
    
    # Tokenize
    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True).to(device)
    
    # Generate
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            num_beams=4,
            early_stopping=True
        )
    
    # Decode
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return response

# Interactive loop
while True:
    user_input = input("\n🤒 Your question: ")
    
    if user_input.lower() in ['quit', 'exit', 'q']:
        print("👋 Goodbye! Stay healthy!")
        break
    
    print("\n🏥 AI is thinking...")
    response = generate_response(user_input)
    
    print(f"\n🏥 AI Response:\n{response}")
    print("\n⚠️  Disclaimer: This is not medical advice. Please consult a healthcare professional for medical concerns.")
