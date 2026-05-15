"""
Process Downloaded Kaggle Datasets
Converts the specific downloaded datasets to training format
"""

import json
import pandas as pd
import os

def process_symptom_disease_dataset():
    """Process Harrachi Mustapha's Symptom-to-Disease Dataset"""
    
    base_path = "/Users/rohitmangalsinggothwal/.cache/kagglehub/datasets/harrachimustapha/symptom-to-disease-medical-dataset/versions/1/Symptom-to-Disease Medical Dataset"
    
    print("📊 Processing Symptom-to-Disease Dataset...")
    
    # Load the CSV files
    diseases_df = pd.read_csv(f"{base_path}/diseases.csv")
    symptoms_df = pd.read_csv(f"{base_path}/symptoms.csv")
    
    print(f"   Found {len(diseases_df)} diseases and {len(symptoms_df)} symptoms")
    
    training_data = []
    
    # Create training examples from diseases
    for _, row in diseases_df.iterrows():
        disease_name = row.get('name', '')
        disease_code = row.get('code', '')
        
        if disease_name:
            # Create symptom-based query
            instruction = f"What are the symptoms of {disease_name}?"
            
            response = f"""**{disease_name}** is a medical condition that requires proper diagnosis by a healthcare professional.

**General Information:**
- Condition Code: {disease_code}
- This condition should be evaluated by a medical professional

**Recommendations:**
- Consult a healthcare provider for proper diagnosis
- Describe all your symptoms clearly
- Follow medical advice and treatment plans

**Suggested Specialist:** General Practitioner or relevant specialist based on symptoms

**Disclaimer:** This information is for educational purposes only. Please consult a healthcare professional for proper diagnosis and treatment."""
            
            training_data.append({
                "instruction": instruction,
                "output": response
            })
    
    print(f"   ✅ Generated {len(training_data)} examples from diseases")
    return training_data

def process_disease_symptom_dataset():
    """Process Itachi9604's Disease Symptom Dataset"""
    
    base_path = "/Users/rohitmangalsinggothwal/.cache/kagglehub/datasets/itachi9604/disease-symptom-description-dataset/versions/2"
    
    print("📊 Processing Disease Symptom Dataset...")
    
    # Load the main dataset
    dataset_df = pd.read_csv(f"{base_path}/dataset.csv")
    precautions_df = pd.read_csv(f"{base_path}/symptom_precaution.csv")
    
    print(f"   Found {len(dataset_df)} disease-symptom records")
    
    training_data = []
    
    # Group by disease
    disease_groups = dataset_df.groupby('Disease')
    
    for disease, group in disease_groups:
        # Get all symptoms for this disease
        symptoms = []
        for _, row in group.iterrows():
            for col in dataset_df.columns:
                if 'Symptom' in col and pd.notna(row[col]):
                    symptoms.append(str(row[col]))
        
        symptoms = list(set([s for s in symptoms if s and s != 'nan']))
        
        if symptoms and disease:
            symptom_text = ", ".join(symptoms[:5])  # Top 5 symptoms
            
            # Get precautions if available
            precautions = []
            prec_row = precautions_df[precautions_df['Disease'] == disease]
            if not prec_row.empty:
                for col in ['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']:
                    if col in prec_row.columns and pd.notna(prec_row.iloc[0][col]):
                        precautions.append(str(prec_row.iloc[0][col]))
            
            precaution_text = "\n- ".join(precautions) if precautions else "Consult a healthcare provider"
            
            instruction = f"I have {symptom_text}. What could this be?"
            
            response = f"""Based on your symptoms of {symptom_text}, you may have **{disease}**.

**Possible Condition:** {disease}

**Common Symptoms:**
- {symptom_text}

**Precautions:**
- {precaution_text}

**Recommendations:**
- Rest and monitor your symptoms
- Stay hydrated
- Consult a healthcare provider for proper diagnosis
- Do not self-medicate

**Suggested Specialist:** General Practitioner

**Urgency Level:** Medium

**Disclaimer:** This is not a medical diagnosis. Please consult a healthcare professional for proper evaluation and treatment."""
            
            training_data.append({
                "instruction": instruction,
                "output": response
            })
    
    print(f"   ✅ Generated {len(training_data)} examples from disease-symptom pairs")
    return training_data

def merge_and_save():
    """Merge all datasets and save to training file"""
    
    print("\n" + "="*50)
    print("🔄 Merging Datasets...")
    print("="*50)
    
    all_data = []
    
    # Process each dataset
    try:
        data1 = process_symptom_disease_dataset()
        all_data.extend(data1)
    except Exception as e:
        print(f"   ⚠️  Error processing symptom-disease dataset: {e}")
    
    try:
        data2 = process_disease_symptom_dataset()
        all_data.extend(data2)
    except Exception as e:
        print(f"   ⚠️  Error processing disease-symptom dataset: {e}")
    
    # Also include our manually created examples
    try:
        with open("medical_data.jsonl", "r") as f:
            manual_data = [json.loads(line) for line in f]
            all_data.extend(manual_data)
            print(f"   ✅ Added {len(manual_data)} manually created examples")
    except:
        print("   ℹ️  No manual examples found")
    
    # Remove duplicates based on instruction
    seen = set()
    unique_data = []
    for item in all_data:
        if item['instruction'] not in seen:
            seen.add(item['instruction'])
            unique_data.append(item)
    
    # Save to file
    output_file = "medical_data_combined.jsonl"
    with open(output_file, 'w') as f:
        for entry in unique_data:
            f.write(json.dumps(entry) + '\n')
    
    print("\n" + "="*50)
    print("✅ Dataset Processing Complete!")
    print("="*50)
    print(f"📊 Total Examples: {len(unique_data)}")
    print(f"💾 Saved to: {output_file}")
    print("\n🚀 Ready for training!")
    print("   Run: python3 train_healthcare_model.py")
    
    # Show sample
    if unique_data:
        print("\n📄 Sample Entry:")
        print("-" * 50)
        print(json.dumps(unique_data[0], indent=2)[:500] + "...")
    
    return len(unique_data)

if __name__ == "__main__":
    merge_and_save()
