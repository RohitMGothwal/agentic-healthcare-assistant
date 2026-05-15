"""
Download Medical Datasets from Kaggle
Make sure you have kagglehub installed: pip install kagglehub
"""

import kagglehub
import os
import shutil

def download_medical_datasets():
    """Download medical datasets from Kaggle"""
    
    print("🏥 Downloading Medical Datasets from Kaggle...")
    print("=" * 50)
    
    datasets = [
        {
            "name": "Symptom to Disease Dataset",
            "url": "harrachimustapha/symptom-to-disease-medical-dataset",
            "description": "Maps symptoms to diseases for training"
        },
        {
            "name": "Medical Q&A Dataset", 
            "url": "taweilo/medical-chatbot-dataset",
            "description": "Medical question-answer pairs"
        },
        {
            "name": "Disease Symptom Dataset",
            "url": "itachi9604/disease-symptom-description-dataset",
            "description": "Comprehensive disease symptoms"
        },
    ]
    
    downloaded_paths = []
    
    for dataset in datasets:
        try:
            print(f"\n📥 Downloading: {dataset['name']}")
            print(f"   Description: {dataset['description']}")
            
            path = kagglehub.dataset_download(dataset['url'])
            print(f"   ✅ Downloaded to: {path}")
            
            downloaded_paths.append({
                'name': dataset['name'],
                'path': path
            })
            
        except Exception as e:
            print(f"   ❌ Error downloading {dataset['name']}: {e}")
            print(f"   Make sure you have Kaggle API credentials set up")
    
    print("\n" + "=" * 50)
    print("📊 Download Summary:")
    print(f"   Successfully downloaded: {len(downloaded_paths)}/{len(datasets)} datasets")
    
    if downloaded_paths:
        print("\n📁 Dataset Locations:")
        for ds in downloaded_paths:
            print(f"   - {ds['name']}: {ds['path']}")
        
        print("\n🔄 Next Steps:")
        print("   1. Check the downloaded CSV files")
        print("   2. Update process_kaggle_datasets.py with the paths")
        print("   3. Run: python process_kaggle_datasets.py")
        print("   4. Train your model: python train_healthcare_model.py")
    
    return downloaded_paths

if __name__ == "__main__":
    # Check if kagglehub is installed
    try:
        import kagglehub
    except ImportError:
        print("❌ kagglehub not installed!")
        print("📦 Installing: pip install kagglehub")
        os.system("pip install kagglehub")
        import kagglehub
    
    # Download datasets
    paths = download_medical_datasets()
    
    print("\n✅ Download process complete!")
