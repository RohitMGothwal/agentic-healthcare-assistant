# Healthcare AI - Medical Dataset Format

## File: medical_data.jsonl

Create a file named `medical_data.jsonl` in the `ai-model/` folder.

## Format (JSON Lines - one JSON object per line):

```json
{"instruction": "I have a headache and fever for 2 days", "output": "Based on your symptoms of headache and fever lasting 2 days, this could indicate a viral infection like the flu or a common cold. It's also possible you may be experiencing a tension headache with a coincidental fever.\n\n**Recommendations:**\n- Rest and stay hydrated\n- Take over-the-counter fever reducers like acetaminophen\n- Monitor your temperature\n\n**When to see a doctor:**\n- If fever exceeds 103°F (39.4°C)\n- If symptoms worsen or persist beyond 5 days\n- If you experience severe headache, stiff neck, or confusion\n\n**Suggested Specialist:** General Practitioner or Family Medicine Doctor\n\n**Disclaimer:** This information is for educational purposes only and not a substitute for professional medical advice."}

{"instruction": "My child has a rash and is itching all over", "output": "A widespread rash with itching in children can have several causes:\n\n**Possible Causes:**\n- Allergic reaction (food, medication, or environmental)\n- Viral exanthem (common in childhood illnesses)\n- Contact dermatitis\n- Eczema flare-up\n- Insect bites\n\n**Immediate Actions:**\n- Keep nails short to prevent scratching\n- Apply cool compresses\n- Use fragrance-free moisturizer\n- Avoid suspected triggers\n\n**When to seek urgent care:**\n- Difficulty breathing\n- Swelling of face/lips\n- High fever with rash\n- Rash that doesn't blanch (fade) when pressed\n\n**Suggested Specialist:** Pediatrician or Dermatologist\n\n**Disclaimer:** This is not medical advice. Please consult your child's pediatrician."}

{"instruction": "I have chest pain when I exercise", "output": "**⚠️ IMPORTANT:** Chest pain during exercise requires medical evaluation. While it may be exercise-induced asthma or muscle strain, it could also indicate a cardiac issue.\n\n**Immediate Actions:**\n- Stop exercising immediately\n- Rest and monitor symptoms\n- Seek emergency care if pain is severe, crushing, or accompanied by shortness of breath\n\n**Possible Causes:**\n- Angina (reduced blood flow to heart)\n- Exercise-induced bronchospasm\n- Costochondritis (inflammation of chest wall)\n- Musculoskeletal pain\n\n**Recommended Next Steps:**\n- Schedule appointment with Cardiologist\n- Get cardiac evaluation including ECG\n- Consider stress test if recommended\n\n**Suggested Specialist:** Cardiologist (urgent consultation recommended)\n\n**Disclaimer:** Chest pain can be serious. Please seek immediate medical attention if symptoms are severe."}

{"instruction": "I've been feeling very tired and thirsty lately", "output": "Persistent fatigue and increased thirst can be symptoms of several conditions:\n\n**Possible Conditions:**\n- Diabetes (Type 1 or Type 2)\n- Thyroid disorders\n- Anemia\n- Sleep disorders\n- Depression\n- Dehydration\n\n**Additional Symptoms to Monitor:**\n- Frequent urination\n- Unexplained weight loss\n- Blurred vision\n- Slow healing wounds\n\n**Recommendations:**\n- Schedule blood work with your doctor\n- Monitor blood sugar if you have a family history\n- Ensure adequate sleep (7-9 hours)\n- Stay hydrated\n\n**Suggested Specialist:** General Practitioner (for initial evaluation and blood tests)\n\n**Disclaimer:** These symptoms require professional medical evaluation. Please consult your doctor."}

{"instruction": "I have back pain that radiates down my leg", "output": "Back pain radiating down the leg (sciatica) is often caused by nerve compression in the lower spine.\n\n**Common Causes:**\n- Herniated disc pressing on sciatic nerve\n- Spinal stenosis\n- Piriformis syndrome\n- Degenerative disc disease\n\n**Self-Care Measures:**\n- Apply ice for first 48 hours, then heat\n- Gentle stretching exercises\n- Over-the-counter pain relievers\n- Maintain good posture\n- Avoid prolonged sitting\n\n**When to See a Doctor:**\n- Pain persists beyond 2 weeks\n- Numbness or weakness in leg\n- Loss of bladder/bowel control\n- Pain is severe or worsening\n\n**Suggested Specialist:** Orthopedic Specialist or Neurologist\n\n**Disclaimer:** This information is educational only. Seek professional medical advice for proper diagnosis."}
```

## Categories to Include:

1. **Common Symptoms:** Headache, fever, cough, fatigue
2. **Pain Management:** Back pain, joint pain, muscle aches
3. **Digestive Issues:** Nausea, stomach pain, diarrhea
4. **Respiratory:** Shortness of breath, chest congestion
5. **Skin Conditions:** Rashes, itching, wounds
6. **Mental Health:** Anxiety, depression, stress
7. **Chronic Conditions:** Diabetes, hypertension, asthma
8. **Pediatric:** Child-specific symptoms and concerns

## Tips for Creating Good Training Data:

1. **Be Specific:** Include symptom duration, severity, and associated symptoms
2. **Include Red Flags:** Mention when symptoms require urgent care
3. **Provide Context:** Age, gender, and medical history when relevant
4. **Suggest Specialists:** Always recommend appropriate medical professionals
5. **Add Disclaimers:** Every response should include medical disclaimers
6. **Be Empathetic:** Use caring, professional tone
7. **Stay Safe:** Never suggest self-diagnosis or self-treatment for serious conditions

## Minimum Dataset Size:

- **Start with:** 100-200 examples
- **Good quality:** 500+ examples
- **Excellent:** 1000+ diverse examples

## Tools to Help:

You can use ChatGPT or Claude to generate initial examples, then review and edit them for accuracy.
