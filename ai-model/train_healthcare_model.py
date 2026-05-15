"""
Healthcare AI Model Training Script
Optimized for MacBook Air M3 with LoRA
"""

from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments
import torch

# Configuration
MODEL_NAME = "unsloth/gemma-3-1b-it"  # Perfect for MacBook Air
MAX_SEQ_LENGTH = 1024
LORA_R = 32
LORA_ALPHA = 64

print("🏥 Loading Healthcare AI Model...")

# 1. Load Model with 4-bit quantization
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=None,  # Auto-detect
    load_in_4bit=True,  # Essential for 8GB MacBook
)

# 2. Setup LoRA for efficient fine-tuning
model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_R,
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
    lora_alpha=LORA_ALPHA,
    lora_dropout=0.05,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

# 3. Healthcare Prompt Template
HEALTHCARE_PROMPT = """### Instruction:
You are a helpful healthcare assistant. Provide accurate, empathetic health information.
Always include a disclaimer that this is not medical advice.
Be concise and professional.

User Query: {}

### Response:
"""

# 4. Training Configuration
training_args = TrainingArguments(
    output_dir="healthcare_model",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    num_train_epochs=3,
    learning_rate=2e-4,
    fp16=False,  # M3 uses bf16
    bf16=True,
    logging_steps=10,
    optim="adamw_8bit",
    weight_decay=0.01,
    lr_scheduler_type="cosine",
    warmup_ratio=0.1,
    group_by_length=True,
    report_to="none",
)

# 5. Prepare Dataset (use combined dataset)
print("📚 Loading medical dataset...")
try:
    dataset = load_dataset("json", data_files="medical_data_combined.jsonl", split="train")

    def format_healthcare_prompt(example):
        """Format medical data for training"""
        text = HEALTHCARE_PROMPT.format(example['instruction']) + example['output']
        return {"text": text}

    dataset = dataset.map(format_healthcare_prompt)

    # 6. Initialize Trainer
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=MAX_SEQ_LENGTH,
        args=training_args,
        packing=True,
    )
    
    # 7. Train
    print("🚀 Starting training...")
    trainer.train()
    
    # 8. Save Model
    print("💾 Saving healthcare model...")
    model.save_pretrained("healthcare_assistant_lora")
    tokenizer.save_pretrained("healthcare_assistant_lora")
    
    print("✅ Training complete! Model saved to 'healthcare_assistant_lora'")
    
except FileNotFoundError:
    print("⚠️  medical_data.jsonl not found!")
    print("Please create your medical dataset file first.")
    print("\nExpected format (JSON Lines):")
    print('{"instruction": "I have a headache and fever", "output": "Based on your symptoms..."}')
