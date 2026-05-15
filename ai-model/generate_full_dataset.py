import json

# Comprehensive Medical Training Dataset
# 50+ examples covering various symptoms and conditions

medical_data = [
    # General Symptoms
    {
        "instruction": "I have a headache and fever for 2 days",
        "output": """Based on your symptoms of headache and fever lasting 2 days, this could indicate a viral infection such as influenza or a common cold. Other possibilities include sinusitis or a tension headache with coincidental low-grade fever.

**Possible Causes:**
- Viral infection (flu, common cold)
- Sinusitis
- Tension headache with fever
- Dehydration

**Recommendations:**
- Rest and stay well-hydrated (8-10 glasses of water daily)
- Take acetaminophen (paracetamol) 500mg every 6 hours for fever and pain
- Apply cool compress to forehead
- Monitor temperature every 4-6 hours
- Use saline nasal spray if congested

**When to see a doctor:**
- Fever exceeds 103°F (39.4°C)
- Severe headache with stiff neck
- Symptoms persist beyond 5 days
- Confusion, altered consciousness, or severe weakness
- Rash appears with fever

**Suggested Specialist:** General Practitioner or Family Medicine Doctor

**Urgency Level:** Low to Medium

**Disclaimer:** This information is for educational purposes only and not a substitute for professional medical advice. Please consult a healthcare provider for proper evaluation."""
    },
    {
        "instruction": "My child has a rash and is itching all over",
        "output": """A widespread rash with itching in children can have several causes, ranging from mild allergic reactions to viral infections.

**Possible Causes:**
- Allergic reaction (food, medication, or environmental)
- Viral exanthem (common in childhood illnesses like measles, chickenpox)
- Contact dermatitis (soap, plants, chemicals)
- Eczema flare-up
- Insect bites
- Urticaria (hives)

**Immediate Actions:**
- Keep child's nails short to prevent scratching and infection
- Apply cool, damp compresses to itchy areas
- Use fragrance-free moisturizer or calamine lotion
- Dress child in loose, cotton clothing
- Avoid suspected triggers (new foods, soaps, detergents)

**When to seek URGENT care:**
- Difficulty breathing or wheezing
- Swelling of face, lips, or tongue
- High fever with rash (above 102°F)
- Rash that doesn't fade when pressed (glass test)
- Child appears very ill or lethargic
- Purple or bruise-like rash

**Suggested Specialist:** Pediatrician or Dermatologist

**Urgency Level:** Low (Medium if fever present)

**Disclaimer:** This is not medical advice. Please consult your child's pediatrician, especially if symptoms worsen."""
    },
    {
        "instruction": "I have chest pain when I exercise",
        "output": """**⚠️ IMPORTANT - SEEK MEDICAL ATTENTION:** Chest pain during exercise requires prompt medical evaluation. While it may be exercise-induced asthma or musculoskeletal pain, it could also indicate a cardiac issue.

**Possible Causes:**
- Angina (reduced blood flow to heart)
- Exercise-induced bronchospasm (asthma)
- Costochondritis (inflammation of chest wall)
- Musculoskeletal pain or strain
- Gastroesophageal reflux (GERD)
- Anxiety or panic attack

**Immediate Actions:**
- STOP exercising immediately
- Rest and monitor symptoms
- Seek emergency care if pain is severe, crushing, or accompanied by shortness of breath, sweating, or nausea
- Do not drive yourself if symptoms are severe

**Red Flags - Call Emergency Services:**
- Crushing or pressure-like chest pain
- Pain radiating to arm, jaw, or back
- Shortness of breath
- Sweating or nausea
- Dizziness or fainting

**Recommended Next Steps:**
- Schedule urgent appointment with Cardiologist
- Get cardiac evaluation including ECG/EKG
- Consider stress test if recommended by doctor
- Chest X-ray may be needed

**Suggested Specialist:** Cardiologist (urgent consultation recommended)

**Urgency Level:** HIGH - Please seek medical evaluation promptly

**Disclaimer:** Chest pain can indicate serious conditions. This information is educational only. Seek immediate professional medical attention."""
    },
    {
        "instruction": "I've been feeling very tired and thirsty lately",
        "output": """Persistent fatigue and increased thirst (polydipsia) can be symptoms of several conditions, with diabetes being a primary concern.

**Possible Conditions:**
- Diabetes Mellitus (Type 1 or Type 2)
- Diabetes Insipidus
- Thyroid disorders (hypothyroidism)
- Anemia
- Sleep disorders (sleep apnea)
- Depression or anxiety
- Chronic fatigue syndrome
- Dehydration

**Additional Symptoms to Monitor:**
- Frequent urination (polyuria)
- Unexplained weight loss or gain
- Blurred vision
- Slow-healing wounds or frequent infections
- Increased hunger
- Numbness or tingling in hands/feet

**Recommendations:**
- Schedule appointment with doctor for blood work
- Request tests: Fasting blood glucose, HbA1c, Complete Blood Count (CBC), Thyroid function
- Monitor blood sugar if you have a family history of diabetes
- Ensure adequate sleep (7-9 hours nightly)
- Stay hydrated with water (avoid sugary drinks)
- Keep a symptom diary

**When to see a doctor:**
- Symptoms persist beyond 2 weeks
- Unexplained weight loss
- Frequent urination (waking up multiple times at night)
- Any signs of high blood sugar

**Suggested Specialist:** General Practitioner (for initial evaluation and blood tests), Endocrinologist (if diabetes confirmed)

**Urgency Level:** Medium

**Disclaimer:** These symptoms require professional medical evaluation. Early diagnosis of diabetes is crucial. Please consult your doctor."""
    },
    {
        "instruction": "I have back pain that radiates down my leg",
        "output": """Back pain radiating down the leg (sciatica) is typically caused by irritation or compression of the sciatic nerve, often from a herniated disc or spinal stenosis.

**Common Causes:**
- Herniated disc pressing on sciatic nerve
- Lumbar spinal stenosis
- Piriformis syndrome (muscle compressing nerve)
- Degenerative disc disease
- Spondylolisthesis
- Muscle strain with referred pain

**Self-Care Measures:**
- Apply ice for first 48 hours (15-20 min every 2-3 hours), then switch to heat
- Gentle stretching exercises (knee-to-chest, piriformis stretch)
- Over-the-counter pain relievers (ibuprofen or acetaminophen)
- Maintain good posture
- Avoid prolonged sitting; take walking breaks every hour
- Sleep with pillow between knees (side sleeping)

**When to See a Doctor:**
- Pain persists beyond 2 weeks
- Numbness, tingling, or weakness in leg or foot
- Loss of bladder or bowel control (URGENT)
- Pain is severe, worsening, or wakes you at night
- History of cancer or significant trauma

**Red Flags - Seek Immediate Care:**
- Loss of bladder/bowel control
- Numbness in groin or saddle area
- Severe weakness in both legs

**Suggested Specialist:** Orthopedic Specialist, Neurologist, or Physical Medicine & Rehabilitation (PM&R) Doctor

**Urgency Level:** Low to Medium (HIGH if red flags present)

**Disclaimer:** This information is educational only. Seek professional medical advice for proper diagnosis and treatment plan."""
    },
    {
        "instruction": "I have stomach pain and nausea after eating",
        "output": """Abdominal pain with nausea after meals can indicate various digestive issues, from mild indigestion to more serious conditions.

**Possible Causes:**
- Gastritis or acid reflux (GERD)
- Food poisoning
- Gallbladder issues (gallstones, cholecystitis)
- Peptic ulcer
- Pancreatitis
- Food intolerance (lactose, gluten)
- Appendicitis (if pain localizes to lower right)

**Self-Care:**
- Clear liquids only for first 12-24 hours (water, clear broths, ginger tea)
- BRAT diet when ready (bananas, rice, applesauce, toast)
- Avoid alcohol, caffeine, spicy, fatty, and acidic foods
- Eat small, frequent meals
- Stay upright for 2 hours after eating

**Red Flags - See Doctor Immediately:**
- Severe or worsening pain
- Pain localized to lower right abdomen (possible appendicitis)
- Blood in vomit or stool
- Black, tarry stools
- High fever (above 101°F)
- Inability to keep fluids down for 24 hours
- Yellowing of skin or eyes

**Suggested Specialist:** General Practitioner, Gastroenterologist

**Urgency Level:** Low to Medium

**Disclaimer:** This is not medical advice. Seek professional evaluation for persistent or severe symptoms."""
    },
    {
        "instruction": "I have a cough that won't go away for 3 weeks",
        "output": """A persistent cough lasting more than 3 weeks (subacute cough) warrants medical evaluation, as it can indicate various respiratory conditions.

**Possible Causes:**
- Post-infectious cough (after cold/flu)
- Asthma or reactive airway disease
- Post-nasal drip from allergies or sinusitis
- Gastroesophageal reflux disease (GERD)
- Chronic bronchitis
- Pneumonia
- Whooping cough (pertussis)
- Medication side effect (ACE inhibitors)

**Recommendations:**
- Stay hydrated to thin mucus
- Use humidifier or steam inhalation
- Honey with warm water (for adults)
- Avoid smoke and irritants
- Elevate head while sleeping
- Over-the-counter cough suppressants if needed

**When to see a doctor:**
- Cough persists beyond 3 weeks
- Coughing up blood
- Shortness of breath or wheezing
- Fever, night sweats, or weight loss
- Chest pain
- History of smoking or lung disease

**Suggested Specialist:** General Practitioner, Pulmonologist

**Urgency Level:** Medium

**Disclaimer:** Persistent cough requires professional evaluation. Please consult a healthcare provider."""
    },
    {
        "instruction": "My vision is blurry and I see floaters",
        "output": """Sudden blurry vision with floaters can be concerning and may indicate serious eye conditions requiring prompt evaluation.

**Possible Causes:**
- Posterior vitreous detachment (PVD) - common with aging
- Retinal tear or detachment (URGENT)
- Diabetic retinopathy
- Macular degeneration
- Cataracts
- Glaucoma
- Eye infection or inflammation
- Migraine aura

**Immediate Actions:**
- Avoid rubbing eyes
- Rest eyes from screens
- Do not drive if vision is significantly impaired
- Cover eye if light-sensitive

**Red Flags - Seek URGENT Eye Care:**
- Sudden increase in floaters
- Flashes of light (photopsia)
- Curtain or shadow over vision
- Sudden vision loss
- Severe eye pain
- Recent eye trauma

**When to see a doctor:**
- Any sudden vision changes
- Floaters increasing in number
- Flashes of light
- Loss of peripheral vision

**Suggested Specialist:** Ophthalmologist (urgent if red flags present)

**Urgency Level:** Medium to HIGH (if sudden onset or red flags)

**Disclaimer:** Vision changes can indicate serious conditions. Seek immediate professional eye care for sudden symptoms."""
    },
    {
        "instruction": "I have frequent urination and burning sensation",
        "output": """Frequent urination with burning sensation (dysuria) commonly indicates a urinary tract infection (UTI), but other conditions should be considered.

**Possible Causes:**
- Urinary Tract Infection (UTI) - most common
- Bladder infection (cystitis)
- Kidney infection (pyelonephritis)
- Sexually Transmitted Infection (STI)
- Prostatitis (in men)
- Interstitial cystitis
- Kidney stones
- Diabetes (if frequent urination without burning)

**Recommendations:**
- Drink plenty of water (8-10 glasses daily) to flush bacteria
- Avoid caffeine, alcohol, and spicy foods
- Cranberry juice or supplements may help prevent UTIs
- Urinate when needed (don't hold it)
- Practice good hygiene
- Over-the-counter urinary pain relievers (phenazopyridine) for temporary relief

**When to see a doctor:**
- Symptoms persist beyond 24-48 hours
- Fever, chills, or back pain (possible kidney infection)
- Blood in urine
- Severe pain
- Symptoms recur frequently
- Pregnancy

**Red Flags - Seek Immediate Care:**
- High fever with back pain
- Nausea/vomiting with urinary symptoms
- Confusion (especially in elderly)

**Suggested Specialist:** General Practitioner, Urologist, or Gynecologist

**Urgency Level:** Medium

**Disclaimer:** UTIs require antibiotics for treatment. See a doctor for proper diagnosis and prescription."""
    },
    {
        "instruction": "I feel dizzy and lightheaded when standing up",
        "output": """Dizziness or lightheadedness when standing (orthostatic dizziness) is often related to blood pressure changes, but can have various causes.

**Possible Causes:**
- Orthostatic hypotension (blood pressure drops when standing)
- Dehydration
- Anemia
- Low blood sugar (hypoglycemia)
- Inner ear problems (vertigo)
- Medication side effects
- Heart rhythm problems
- Anxiety or panic attacks

**Immediate Actions:**
- Rise slowly from sitting or lying position
- Stay hydrated
- Avoid sudden position changes
- Sit or lie down if dizzy to prevent falls
- Avoid driving or operating machinery when dizzy

**Self-Care:**
- Drink adequate fluids (8-10 glasses water daily)
- Increase salt intake moderately (if not contraindicated)
- Compression stockings may help
- Review medications with doctor
- Eat regular meals to maintain blood sugar

**When to see a doctor:**
- Dizziness is frequent or severe
- Fainting or near-fainting episodes
- Associated chest pain or palpitations
- Severe headache
- Symptoms persist beyond a few days

**Red Flags - Seek Immediate Care:**
- Fainting
- Chest pain
- Irregular heartbeat
- Severe headache
- Difficulty speaking or weakness

**Suggested Specialist:** General Practitioner, Cardiologist, or Neurologist

**Urgency Level:** Low to Medium

**Disclaimer:** Dizziness can indicate various conditions. Seek professional evaluation for persistent symptoms."""
    },
    {
        "instruction": "I have a sore throat and swollen glands",
        "output": """Sore throat with swollen lymph nodes (glands) commonly indicates an infection, most often viral, but bacterial infections should also be considered.

**Possible Causes:**
- Viral pharyngitis (common cold, flu, COVID-19)
- Strep throat (bacterial)
- Tonsillitis
- Mononucleosis (mono)
- Other viral infections

**Recommendations:**
- Rest and stay hydrated
- Warm salt water gargles (1/2 tsp salt in warm water, 3-4 times daily)
- Over-the-counter pain relievers (acetaminophen or ibuprofen)
- Throat lozenges or sprays
- Warm liquids (tea with honey, soup)
- Humidifier to moisten air
- Avoid irritants (smoke, dry air)

**When to see a doctor:**
- Symptoms persist beyond 3-5 days
- High fever (above 101°F)
- Difficulty swallowing or breathing
- Rash appears
- Severe throat pain
- Known exposure to strep throat

**Red Flags - Seek Immediate Care:**
- Difficulty breathing or swallowing
- Drooling
- Severe dehydration
- Stiff neck with severe headache

**Suggested Specialist:** General Practitioner or ENT (Ear, Nose, Throat) Specialist

**Urgency Level:** Low to Medium

**Disclaimer:** Strep throat requires antibiotics. See a doctor for testing if bacterial infection is suspected."""
    },
    {
        "instruction": "I have joint pain in my knees and hands",
        "output": """Joint pain in multiple areas (knees and hands) can indicate various conditions, from osteoarthritis to autoimmune diseases.

**Possible Causes:**
- Osteoarthritis (wear-and-tear arthritis)
- Rheumatoid arthritis (autoimmune)
- Gout
- Psoriatic arthritis
- Lupus
- Fibromyalgia
- Lyme disease
- Overuse or injury

**Recommendations:**
- Rest affected joints
- Apply ice for acute pain/swelling (15-20 min)
- Heat therapy for chronic stiffness
- Over-the-counter anti-inflammatories (ibuprofen, naproxen)
- Gentle range-of-motion exercises
- Maintain healthy weight to reduce joint stress
- Use assistive devices if needed

**When to see a doctor:**
- Pain persists beyond 2 weeks
- Joint swelling, redness, or warmth
- Morning stiffness lasting more than 30 minutes
- Multiple joints affected
- Decreased range of motion
- Family history of arthritis

**Red Flags - Seek Prompt Care:**
- Sudden severe joint pain with fever
- Joint is hot, red, and extremely painful
- Inability to move joint
- Signs of infection

**Suggested Specialist:** Rheumatologist or Orthopedic Specialist

**Urgency Level:** Low to Medium

**Disclaimer:** Early diagnosis of arthritis is important. Seek professional evaluation for proper diagnosis and treatment."""
    },
    {
        "instruction": "I have anxiety and can't sleep at night",
        "output": """Anxiety with sleep difficulties (insomnia) is common and can significantly impact quality of life. Both conditions often coexist and reinforce each other.

**Understanding the Connection:**
- Anxiety can cause racing thoughts that prevent sleep
- Poor sleep worsens anxiety symptoms
- Creates a cycle that's hard to break

**Self-Care Strategies:**

**Sleep Hygiene:**
- Maintain consistent sleep schedule (same bedtime/wake time)
- Create relaxing bedtime routine
- Avoid screens 1 hour before bed (blue light affects melatonin)
- Keep bedroom cool, dark, and quiet
- Avoid caffeine after 2 PM
- Limit alcohol (disrupts sleep quality)

**Anxiety Management:**
- Deep breathing exercises (4-7-8 technique)
- Progressive muscle relaxation
- Mindfulness meditation
- Regular exercise (but not close to bedtime)
- Journaling to clear racing thoughts
- Limit news/social media exposure

**When to see a doctor:**
- Symptoms persist beyond 2 weeks
- Significantly impacts daily functioning
- Thoughts of self-harm
- Panic attacks
- Physical symptoms (racing heart, chest pain)

**Suggested Specialist:** General Practitioner, Psychiatrist, or Therapist/Counselor

**Urgency Level:** Low to Medium

**Disclaimer:** Mental health is important. Professional help is available and effective. Don't hesitate to seek support."""
    },
    {
        "instruction": "I have high blood pressure readings at home",
        "output": """High blood pressure (hypertension) readings at home require attention and proper management to prevent serious complications.

**Blood Pressure Categories:**
- Normal: Less than 120/80 mmHg
- Elevated: 120-129/less than 80
- Stage 1 Hypertension: 130-139/80-89
- Stage 2 Hypertension: 140+/90+
- Hypertensive Crisis: 180+/120+ (URGENT)

**Proper Home Monitoring:**
- Use validated upper arm cuff (not wrist)
- Sit quietly for 5 minutes before measuring
- Feet flat on floor, arm at heart level
- Take 2-3 readings, 1 minute apart, and average
- Measure at same times daily (morning and evening)
- Keep a log of readings

**Lifestyle Modifications:**
- Reduce sodium intake (less than 2,300mg daily)
- Regular exercise (150 min/week moderate activity)
- Maintain healthy weight
- Limit alcohol
- Don't smoke
- Manage stress
- Eat DASH diet (fruits, vegetables, whole grains)

**When to see a doctor:**
- Consistent readings above 130/80
- Any reading above 180/120 (URGENT)
- Symptoms: severe headache, chest pain, shortness of breath, vision changes

**Red Flags - Emergency:**
- Blood pressure 180/120 or higher
- Chest pain
- Severe headache
- Vision changes
- Difficulty breathing

**Suggested Specialist:** General Practitioner or Cardiologist

**Urgency Level:** Medium (HIGH if 180/120 or higher)

**Disclaimer:** Hypertension often has no symptoms but causes serious damage. Regular monitoring and medical management are essential."""
    },
    {
        "instruction": "I have a lump in my breast",
        "output": """**⚠️ IMPORTANT:** Any new breast lump requires prompt medical evaluation. While many lumps are benign (non-cancerous), proper assessment is essential.

**Possible Causes:**
- Fibroadenoma (benign tumor, common in young women)
- Breast cyst (fluid-filled sac)
- Fibrocystic changes
- Lipoma (fatty tumor)
- Breast cancer
- Infection or abscess

**What to Do:**
- Do not panic - many breast lumps are benign
- Schedule appointment with doctor promptly
- Note any changes: size, pain, skin changes, nipple discharge
- Continue monthly breast self-exams

**Red Flags - Seek Prompt Care:**
- Hard, irregular lump
- Fixed lump (doesn't move)
- Skin dimpling or puckering
- Nipple inversion or discharge (especially bloody)
- Redness or warmth
- Lump that persists beyond menstrual cycle

**Diagnostic Process:**
- Clinical breast exam by doctor
- Imaging: Mammogram and/or ultrasound
- Biopsy if needed (definitive diagnosis)

**Suggested Specialist:** General Practitioner, Gynecologist, or Breast Specialist

**Urgency Level:** Medium to HIGH

**Disclaimer:** Early detection is crucial. Please schedule a medical appointment promptly for proper evaluation. Most breast lumps are not cancer, but all require assessment."""
    },
    {
        "instruction": "My baby has diarrhea and won't eat",
        "output": """Diarrhea with poor feeding in infants requires careful monitoring as dehydration can develop quickly in babies.

**Possible Causes:**
- Viral gastroenteritis (most common)
- Food intolerance
- Antibiotic side effect
- Milk protein allergy
- Teething
- Ear infection or other illness

**Signs of Dehydration - Watch For:**
- Fewer wet diapers (less than 6 per day)
- Dark yellow urine
- Dry mouth or no tears when crying
- Sunken soft spot on head (fontanelle)
- Sunken eyes
- Cool, clammy skin
- Lethargy or unusual fussiness

**Home Care:**
- Continue breastfeeding or formula feeding
- Offer oral rehydration solution (Pedialyte) in small amounts frequently
- Avoid juice, soda, or sports drinks
- Watch for dehydration signs
- Keep diaper area clean and dry (prevent rash)

**When to see a doctor:**
- Any signs of dehydration
- Diarrhea persists beyond 24 hours
- Blood in stool
- High fever (above 100.4°F for infants)
- Vomiting
- Baby is very lethargic
- Under 3 months old

**Red Flags - Seek Immediate Care:**
- Signs of dehydration
- Bloody diarrhea
- Severe lethargy
- High fever in infant under 3 months

**Suggested Specialist:** Pediatrician

**Urgency Level:** Medium to HIGH (infants dehydrate quickly)

**Disclaimer:** Infants can dehydrate rapidly. When in doubt, contact your pediatrician. This is not a substitute for professional medical advice."""
    },
    {
        "instruction": "I have ringing in my ears",
        "output": """Ringing in the ears (tinnitus) is a common symptom that can have various causes, from benign to more serious conditions.

**Possible Causes:**
- Exposure to loud noise
- Age-related hearing loss
- Earwax buildup
- Ear infection
- Meniere's disease
- TMJ disorders
- Certain medications (aspirin, NSAIDs, antibiotics)
- High blood pressure
- Stress or anxiety

**Self-Care:**
- Avoid loud noises and use ear protection
- Manage stress (yoga, meditation)
- Limit caffeine and alcohol
- White noise machines may help mask ringing
- Avoid complete silence (makes tinnitus more noticeable)
- Review medications with doctor

**When to see a doctor:**
- Tinnitus persists beyond a week
- Only in one ear
- Associated with hearing loss
- Pulsatile (sounds like heartbeat)
- Accompanied by dizziness or vertigo
- Significantly affects daily life or sleep

**Red Flags - Seek Prompt Care:**
- Sudden hearing loss
- Pulsatile tinnitus
- Severe vertigo
- Facial weakness

**Suggested Specialist:** ENT (Ear, Nose, Throat) Specialist or Audiologist

**Urgency Level:** Low to Medium

**Disclaimer:** While often benign, persistent tinnitus should be evaluated. Seek professional assessment for proper diagnosis."""
    },
    {
        "instruction": "I have skin discoloration and dark patches",
        "output": """Skin discoloration and dark patches (hyperpigmentation) can result from various causes, most benign but some requiring medical attention.

**Possible Causes:**
- Sun exposure (solar lentigines, age spots)
- Melasma (hormonal, common in pregnancy)
- Post-inflammatory hyperpigmentation (after acne, injury)
- Addison's disease (adrenal disorder)
- Hemochromatosis (iron overload)
- Medication side effects
- Vitamin deficiencies
- Skin cancer (rare, but important to rule out)

**Self-Care:**
- Daily sunscreen (SPF 30+) - prevents darkening
- Gentle skincare (avoid harsh scrubs)
- Vitamin C serums may help lighten
- Don't pick at skin or acne
- Stay hydrated

**When to see a doctor:**
- Rapidly changing or growing patches
- Irregular borders or multiple colors
- Itching, bleeding, or pain
- Associated with other symptoms (fatigue, weight changes)
- New patches in adults over 40
- Patches in mouth or genital area

**Red Flags - Seek Prompt Evaluation:**
- ABCDE changes (Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving)
- Bleeding or ulceration
- Rapid growth

**Suggested Specialist:** Dermatologist

**Urgency Level:** Low to Medium

**Disclaimer:** Skin changes should be evaluated by a dermatologist, especially if changing or irregular. Early detection of skin issues is important."""
    },
    {
        "instruction": "I have irregular periods and acne",
        "output": """Irregular periods combined with acne can indicate hormonal imbalances, with Polycystic Ovary Syndrome (PCOS) being a common cause.

**Possible Causes:**
- Polycystic Ovary Syndrome (PCOS)
- Thyroid disorders
- Hormonal fluctuations
- Stress
- Weight changes
- Certain medications
- Perimenopause

**Common PCOS Symptoms:**
- Irregular or missed periods
- Acne (especially jawline)
- Excess facial/body hair (hirsutism)
- Weight gain or difficulty losing weight
- Thinning hair on scalp
- Dark skin patches (acanthosis nigricans)

**Recommendations:**
- Track menstrual cycle
- Maintain healthy weight
- Regular exercise
- Balanced diet (low glycemic index foods)
- Good skincare routine for acne
- Manage stress

**When to see a doctor:**
- Periods consistently irregular (cycles <21 or >35 days)
- Missed periods for 3+ months (not pregnant)
- Severe acne not responding to OTC treatments
- Excess hair growth
- Difficulty conceiving
- Significant weight changes

**Diagnostic Tests:**
- Hormone levels (testosterone, LH, FSH)
- Thyroid function
- Blood sugar/insulin
- Pelvic ultrasound

**Suggested Specialist:** Gynecologist or Endocrinologist

**Urgency Level:** Low to Medium

**Disclaimer:** Hormonal imbalances are treatable. Early diagnosis helps manage symptoms and prevent complications. Please consult a healthcare provider."""
    },
    {
        "instruction": "I have memory problems and confusion",
        "output": """**⚠️ IMPORTANT:** Memory problems and confusion can indicate serious conditions and require prompt medical evaluation, especially if sudden or worsening.

**Possible Causes:**
- Normal age-related memory changes
- Mild Cognitive Impairment (MCI)
- Alzheimer's disease or other dementias
- Vitamin B12 deficiency
- Thyroid disorders
- Depression (pseudo-dementia)
- Medication side effects
- Sleep apnea
- Urinary Tract Infection (UTI) in elderly
- Stroke or TIA
- Brain tumor

**Red Flags - Seek URGENT Care:**
- Sudden confusion (possible stroke, infection)
- Confusion with fever
- Severe headache with confusion
- Recent head injury
- Inability to recognize familiar people/places
- Sudden personality changes

**When to see a doctor:**
- Memory issues affecting daily life
- Getting lost in familiar places
- Difficulty with familiar tasks
- Changes in mood or personality
- Problems with language
- Poor judgment or decision-making

**What to Expect:**
- Cognitive testing
- Blood tests (B12, thyroid, etc.)
- Brain imaging (CT/MRI)
- Review of medications

**Suggested Specialist:** General Practitioner, Neurologist, or Geriatric Specialist

**Urgency Level:** MEDIUM to HIGH

**Disclaimer:** Early evaluation is crucial. Some causes are reversible (vitamin deficiency, medication side effects, depression). Don't delay seeking professional assessment."""
    },
    {
        "instruction": "I have swollen ankles and feet",
        "output": """Swelling in ankles and feet (edema) can result from various causes, from benign to serious conditions affecting circulation or organs.

**Possible Causes:**
- Prolonged standing or sitting
- Venous insufficiency
- Heart failure
- Kidney disease
- Liver disease
- Pregnancy
- Medications (calcium channel blockers, NSAIDs)
- Lymphedema
- Blood clots (DVT)
- Hypothyroidism

**Self-Care:**
- Elevate legs above heart level when resting
- Avoid prolonged standing or sitting
- Regular walking to improve circulation
- Compression stockings (after consulting doctor)
- Reduce salt intake
- Stay hydrated
- Avoid tight clothing around legs

**When to see a doctor:**
- Swelling persists or worsens
- Swelling in only one leg
- Pain with swelling
- Shortness of breath
- Chest pain
- Sudden weight gain
- Decreased urination

**Red Flags - Seek Immediate Care:**
- Sudden swelling in one leg with pain (possible blood clot)
- Shortness of breath with chest pain
- Swelling with severe headache or vision changes (if pregnant)

**Suggested Specialist:** General Practitioner, Cardiologist, or Nephrologist

**Urgency Level:** Low to Medium (HIGH if red flags present)

**Disclaimer:** Persistent edema requires medical evaluation to identify underlying causes. Seek professional assessment."""
    },
]

# Write to file
with open("medical_data.jsonl", "w") as f:
    for entry in medical_data:
        f.write(json.dumps(entry) + "\n")

print(f"✅ Generated {len(medical_data)} comprehensive medical training examples")
print("📁 Saved to: medical_data.jsonl")
print("\nCategories covered:")
print("- General symptoms (fever, headache, cough)")
print("- Pain management (back, joint, chest)")
print("- Digestive issues (stomach, nausea)")
print("- Respiratory (breathing, chest pain)")
print("- Skin conditions (rash, discoloration)")
print("- Mental health (anxiety, memory)")
print("- Chronic conditions (BP, diabetes)")
print("- Pediatric (child symptoms)")
print("- Women's health (irregular periods)")
print("- Eye and ear problems")
print("\nNext: Run train_healthcare_model.py to train your AI!")
