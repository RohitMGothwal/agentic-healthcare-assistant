"""
Test Healthcare AI Model
Run this after training to verify the model works
"""

from unsloth import FastLanguageModel
import torch

print("🧪 Testing Healthcare AI Model...")

# Load model
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="healthcare_assistant_lora",
    max_seq_length=1024,
    load_in_4bit=True,
)

FastLanguageModel.for_inference(model)

# Test prompts
test_cases = [
    "I have a headache and fever",
    "My child has a rash",
    "I've been feeling very tired lately",
    "I have chest pain when I breathe",
]

print("\n" + "="*50)
print("🩺 Healthcare AI Test Results")
print("="*50)

for i, test in enumerate(test_cases, 1):
    print(f"\nTest {i}: {test}")
    print("-" * 50)
    
    prompt = f"### Instruction:\n{test}\n\n### Response:\n"
    
    inputs = tokenizer(prompt, return_tensors="pt").to("mps")
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=300,
        temperature=0.7,
        do_sample=True,
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract just the response part
    if "### Response:" in response:
        answer = response.split("### Response:")[1].strip()
    else:
        answer = response[len(prompt):].strip()
    
    print(f"AI Response: {answer[:200]}...")  # Show first 200 chars
    print()

print("="*50)
print("✅ Testing complete!")
