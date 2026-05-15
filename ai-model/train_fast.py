"""
Fast Healthcare AI Training - Small Model for MacBook
Uses distilgpt2 (much smaller, faster training)
"""

from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model
import torch
import json

print("🏥 Fast Healthcare AI Training (Small Model)")
print("=" * 50)

# Configuration - Using smaller model
MODEL_NAME = "distilgpt2"  # Much smaller: ~82M parameters
MAX_SEQ_LENGTH = 256

# Set device
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print(f"📱 Device: {device}")

# 1. Load Model and Tokenizer
print("\n📥 Loading small model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True,
).to(device)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

# 2. Setup LoRA
print("🔧 Setting up LoRA...")
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["c_attn", "c_proj"],  # GPT-2 specific
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)
print(f"📊 Trainable parameters: {model.print_trainable_parameters()}")

# 3. Healthcare Prompt Template
HEALTHCARE_PROMPT = """### Instruction:
You are a helpful healthcare assistant. Provide accurate, empathetic health information.
Always include a disclaimer that this is not medical advice.
Be concise and professional.

User Query: {}

### Response:
{}"""

# 4. Load and Format Dataset
print("\n📚 Loading medical dataset...")
try:
    # Load JSONL file directly
    texts = []
    with open("medical_data_combined.jsonl", "r") as f:
        for line in f:
            data = json.loads(line.strip())
            text = HEALTHCARE_PROMPT.format(data['instruction'], data['output'])
            texts.append(text)
    
    print(f"✅ Loaded {len(texts)} training examples")
    
    # Create simple dataset class
    class MedicalDataset:
        def __init__(self, texts, tokenizer, max_length):
            self.texts = texts
            self.tokenizer = tokenizer
            self.max_length = max_length
        
        def __len__(self):
            return len(self.texts)
        
        def __getitem__(self, idx):
            text = self.texts[idx]
            encoding = self.tokenizer(
                text,
                truncation=True,
                max_length=self.max_length,
                padding="max_length",
                return_tensors="pt",
            )
            return {
                "input_ids": encoding["input_ids"].squeeze(),
                "attention_mask": encoding["attention_mask"].squeeze(),
                "labels": encoding["input_ids"].squeeze(),
            }
    
    dataset = MedicalDataset(texts, tokenizer, MAX_SEQ_LENGTH)
    
    # 5. Training Arguments - Optimized for speed
    training_args = TrainingArguments(
        output_dir="healthcare_model_fast",
        per_device_train_batch_size=4,  # Larger batch size for small model
        gradient_accumulation_steps=2,
        num_train_epochs=3,
        learning_rate=5e-4,  # Higher learning rate for faster convergence
        fp16=False,
        logging_steps=5,
        save_strategy="epoch",
        optim="adamw_torch",
        warmup_steps=5,
        report_to="none",
        dataloader_pin_memory=False,
    )
    
    # 6. Data Collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )
    
    # 7. Initialize Trainer
    print("🚀 Starting training...")
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        data_collator=data_collator,
    )
    
    # 8. Train
    trainer.train()
    
    # 9. Save Model
    print("\n💾 Saving healthcare model...")
    model.save_pretrained("healthcare_assistant_fast")
    tokenizer.save_pretrained("healthcare_assistant_fast")
    
    print("\n" + "=" * 50)
    print("✅ Training complete!")
    print("📁 Model saved to: healthcare_assistant_fast/")
    print("=" * 50)
    
except FileNotFoundError:
    print("❌ medical_data_combined.jsonl not found!")
    print("Please run: python3 process_downloaded_datasets.py")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
