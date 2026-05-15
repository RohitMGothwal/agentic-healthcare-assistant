# 🏥 Healthcare AI Model

Custom AI model for healthcare symptom checking and advice.

## 📁 Files Created

- `train_healthcare_model.py` - Training script
- `inference_server.py` - FastAPI server for model inference
- `test_model.py` - Test the trained model
- `generate_dataset.py` - Generate sample medical data
- `DATASET_GUIDE.md` - Guide for creating medical training data
- `medical_data.jsonl` - Your medical dataset (you create this)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
pip install unsloth transformers datasets trl fastapi uvicorn
```

### Step 2: Create Medical Dataset

Option A: Generate sample data
```bash
python generate_dataset.py
```

Option B: Create your own `medical_data.jsonl` file

Format:
```json
{"instruction": "I have a headache", "output": "Based on your symptoms..."}
{"instruction": "My child has a fever", "output": "For children with fever..."}
```

See `DATASET_GUIDE.md` for detailed instructions.

### Step 3: Train the Model

```bash
python train_healthcare_model.py
```

**Training Time:** ~30-60 minutes on MacBook Air M3 (for 100-200 examples)

**Output:** `healthcare_assistant_lora/` folder

### Step 4: Test the Model

```bash
python test_model.py
```

### Step 5: Run Inference Server

```bash
python inference_server.py
```

Server runs on `http://localhost:8001`

## 🔌 Integration with Healthcare App

### Update Backend API

Add this endpoint to your FastAPI backend:

```python
@app.post("/ai/analyze")
async def analyze_with_local_ai(query: HealthQuery):
    """Forward to local AI model"""
    import requests
    
    response = requests.post(
        "http://localhost:8001/analyze",
        json=query.dict()
    )
    
    return response.json()
```

### Mobile App Integration

The mobile app already calls `/chat/` endpoint. Just update the backend to use your local AI instead of external API.

## 💻 MacBook Air M3 Optimization

Your M3 MacBook is perfect for this:

- **Training:** Uses ~6GB RAM with 4-bit quantization
- **Inference:** Fast response times (~1-2 seconds)
- **Power:** Efficient on Apple Silicon

## 🎯 Model Capabilities

Your healthcare AI will provide:

1. ✅ **Symptom Analysis** - Initial assessment of symptoms
2. ✅ **Possible Conditions** - List of potential causes (with caution)
3. ✅ **Recommendations** - General self-care advice
4. ✅ **Specialist Referral** - Which doctor to consult
5. ✅ **Urgency Assessment** - When to seek immediate care
6. ✅ **Medical Disclaimers** - Always included

## ⚠️ Important Safety Notes

1. **Never Diagnose** - Always suggest consulting professionals
2. **Include Disclaimers** - Every response must have medical disclaimer
3. **Flag Emergencies** - Clearly mark urgent symptoms
4. **Stay General** - Don't provide specific medical advice
5. **Be Empathetic** - Professional but caring tone

## 📊 Dataset Size Recommendations

- **Minimum:** 100 examples
- **Good:** 500 examples
- **Excellent:** 1000+ examples

## 🔧 Troubleshooting

**Out of Memory?**
- Reduce `max_seq_length` to 512
- Reduce `per_device_train_batch_size` to 1
- Increase `gradient_accumulation_steps` to 8

**Model not loading?**
- Ensure `healthcare_assistant_lora` folder exists
- Check model files are not corrupted

**Slow inference?**
- Use `load_in_4bit=True` (already set)
- Reduce `max_new_tokens` to 200

## 🎓 Next Steps

1. Create your medical dataset
2. Train the model
3. Test with sample queries
4. Integrate with your backend
5. Deploy and test with mobile app

## 📞 Support

Need help? Check:
- `DATASET_GUIDE.md` for dataset creation tips
- Unsloth documentation: https://github.com/unslothai/unsloth
- FastAPI docs: https://fastapi.tiangolo.com/
