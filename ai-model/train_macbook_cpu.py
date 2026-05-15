"""
Healthcare AI Model Training for MacBook Air M3
Uses Hugging Face Transformers + PEFT (LoRA)
Compatible with Apple Silicon (MPS backend)
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

print("🏥 Healthcare AI Training for MacBook Air M3")
print("=" * 50)

# Configuration
MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"  # Open model, no auth needed
MAX_SEQ_LENGTH = 512

# Set device - use CPU to avoid MPS issues
device = torch.device("cpu")
print(f"📱 Device: {device} (using CPU for stability)")

# 1. Load Model and Tokenizer
print("\n📥 Loading model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float32,  # Use float32 for CPU
    trust_remote_code=True,
).to(device)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

# 2. Setup LoRA
print("🔧 Setting up LoRA...")
lora_config = LoraConfig(
    r=8,  # Reduced for CPU training
    lora_alpha=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
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
    
    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir="healthcare_model",
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        num_train_epochs=2,
        learning_rate=2e-4,
        fp16=False,  # Disable fp16 for CPU
        logging_steps=5,
        save_strategy="epoch",
        optim="adamw_torch",
        warmup_steps=10,
        report_to="none",
        dataloader_pin_memory=False,  # Disable pin_memory for CPU
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
    model.save_pretrained("healthcare_assistant_lora")
    tokenizer.save_pretrained("healthcare_assistant_lora")
    
    print("\n" + "=" * 50)
    print("✅ Training complete!")
    print("📁 Model saved to: healthcare_assistant_lora/")
    print("=" * 50)
    
except FileNotFoundError:
    print("❌ medical_data_combined.jsonl not found!")
    print("Please run: python3 process_downloaded_datasets.py")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
