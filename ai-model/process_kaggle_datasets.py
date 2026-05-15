"""
Download and Process Kaggle Medical Datasets
Converts various medical datasets to training format
"""

import json
import pandas as pd
import os

def process_symptom_disease_dataset(csv_path):
    """Process Harrachi Mustapha's Symptom to Disease Dataset"""
    
    print(f"📊 Processing: {csv_path}")
    
    # Read CSV
    df = pd.read_csv(csv_path)
    
    training_data = []
    
    for _, row in df.iterrows():
        # Extract symptoms (assuming columns like 'Symptom_1', 'Symptom_2', etc.)
        symptoms = []
        disease = row.get('Disease', '')
        
        # Get all symptom columns
        for col in df.columns:
            if 'symptom' in col.lower() and pd.notna(row[col]):
                symptoms.append(str(row[col]))
        
        if symptoms and disease:
            symptom_text = ", ".join(symptoms)
            
            # Create healthcare response
            response = f"""Based on your symptoms of {symptom_text}, you may have {disease}.

**Possible Condition:** {disease}

**Recommendations:**
- Rest and monitor your symptoms
- Stay hydrated
- Consult a healthcare provider for proper diagnosis

**Suggested Specialist:** General Practitioner

**Disclaimer:** This is not a medical diagnosis. Please consult a healthcare professional for proper evaluation and treatment."""
            
            training_data.append({
                "instruction": f"I have {symptom_text}",
                "output": response
            })
    
    print(f"✅ Processed {len(training_data)} examples from Symptom-Disease dataset")
    return training_data

def process_medical_qa_dataset(csv_path):
    """Process Medical Q&A dataset"""
    
    print(f"📊 Processing: {csv_path}")
    
    df = pd.read_csv(csv_path)
    
    training_data = []
    
    for _, row in df.iterrows():
        question = row.get('Question', row.get('question', ''))
        answer = row.get('Answer', row.get('answer', ''))
        
        if question and answer:
            # Add healthcare disclaimer if not present
            if "disclaimer" not in answer.lower():
                answer += "\n\n**Disclaimer:** This information is for educational purposes only and not a substitute for professional medical advice."
            
            training_data.append({
                "instruction": question,
                "output": answer
            })
    
    print(f"✅ Processed {len(training_data)} examples from Medical Q&A dataset")
    return training_data

def process_generic_medical_dataset(csv_path):
    """Process generic medical dataset with instruction/output columns"""
    
    print(f"📊 Processing: {csv_path}")
    
    df = pd.read_csv(csv_path)
    
    training_data = []
    
    # Try to identify columns
    instruction_cols = [col for col in df.columns if any(word in col.lower() for word in ['instruction', 'question', 'symptom', 'input', 'prompt'])]
    output_cols = [col for col in df.columns if any(word in col.lower() for word in ['output', 'answer', 'response', 'disease', 'diagnosis', 'treatment'])]
    
    if instruction_cols and output_cols:
        for _, row in df.iterrows():
            instruction = str(row[instruction_cols[0]])
            output = str(row[output_cols[0]])
            
            if instruction and output and instruction != 'nan' and output != 'nan':
                training_data.append({
                    "instruction": instruction,
                    "output": output
                })
    
    print(f"✅ Processed {len(training_data)} examples")
    return training_data

def merge_datasets(dataset_paths):
    """Merge multiple datasets into one training file"""
    
    all_data = []
    
    for path in dataset_paths:
        if not os.path.exists(path):
            print(f"⚠️  File not found: {path}")
            continue
        
        try:
            # Detect dataset type by filename
            filename = os.path.basename(path).lower()
            
            if 'symptom' in filename and 'disease' in filename:
                data = process_symptom_disease_dataset(path)
            elif 'qa' in filename or 'question' in filename:
                data = process_medical_qa_dataset(path)
            else:
                data = process_generic_medical_dataset(path)
            
            all_data.extend(data)
            
        except Exception as e:
            print(f"❌ Error processing {path}: {e}")
    
    return all_data

def save_training_data(data, output_file="medical_data.jsonl"):
    """Save processed data to JSONL format"""
    
    with open(output_file, 'w') as f:
        for entry in data:
            f.write(json.dumps(entry) + '\n')
    
    print(f"\n💾 Saved {len(data)} total examples to {output_file}")
    print("✅ Dataset ready for training!")

# Example usage
if __name__ == "__main__":
    
    # Add your downloaded dataset paths here
    dataset_paths = [
        # "path/to/symptom_disease_dataset.csv",
        # "path/to/medical_qa_dataset.csv",
    ]
    
    if not dataset_paths or dataset_paths == ['']:
        print("📋 Usage Instructions:")
        print("1. Download datasets using Kaggle")
        print("2. Update dataset_paths list with your CSV files")
        print("3. Run: python process_datasets.py")
        print("\nExample:")
        print('dataset_paths = [')
        print('    "downloads/symptom_disease_dataset.csv",')
        print('    "downloads/medical_qa.csv",')
        print(']')
    else:
        # Process and merge datasets
        training_data = merge_datasets(dataset_paths)
        
        # Save to file
        save_training_data(training_data)
        
        # Show sample
        if training_data:
            print("\n📄 Sample entry:")
            print(json.dumps(training_data[0], indent=2))
