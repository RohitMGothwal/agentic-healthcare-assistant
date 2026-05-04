// Offline Healthcare Data for Agentic Health Assistant
// This data is used when the app is offline or backend is unavailable

export interface HealthCondition {
  id: string;
  name: string;
  symptoms: string[];
  description: string;
  selfCare: string[];
  whenToSeeDoctor: string[];
  severity: 'low' | 'medium' | 'high' | 'emergency';
}

export interface FirstAidGuide {
  id: string;
  emergency: string;
  steps: string[];
  donts: string[];
  callEmergency: boolean;
}

export interface HealthTip {
  id: string;
  category: 'nutrition' | 'exercise' | 'mental' | 'sleep' | 'prevention';
  title: string;
  content: string;
}

export const commonConditions: HealthCondition[] = [
  {
    id: '1',
    name: 'Common Cold',
    symptoms: ['Runny nose', 'Sneezing', 'Sore throat', 'Cough', 'Mild fever', 'Headache'],
    description: 'A viral infection of the upper respiratory tract that usually resolves within 7-10 days.',
    selfCare: [
      'Get plenty of rest',
      'Drink fluids (water, warm tea, soup)',
      'Use saline nasal spray',
      'Gargle with warm salt water',
      'Take OTC pain relievers if needed',
      'Use a humidifier'
    ],
    whenToSeeDoctor: [
      'Fever higher than 101.3°F (38.5°C)',
      'Symptoms last more than 10 days',
      'Severe sinus pain',
      'Ear pain',
      'Difficulty breathing'
    ],
    severity: 'low'
  },
  {
    id: '2',
    name: 'Headache - Tension',
    symptoms: ['Dull aching head pain', 'Tightness across forehead', 'Tenderness in scalp', 'Neck stiffness'],
    description: 'The most common type of headache, often caused by stress, anxiety, or muscle strain.',
    selfCare: [
      'Apply heat or ice to head/neck',
      'Take a warm bath',
      'Practice relaxation techniques',
      'Get adequate sleep',
      'Stay hydrated',
      'Limit caffeine'
    ],
    whenToSeeDoctor: [
      'Sudden severe headache',
      'Headache with fever and stiff neck',
      'Headache after head injury',
      'Vision changes',
      'Headache that worsens over time'
    ],
    severity: 'low'
  },
  {
    id: '3',
    name: 'Indigestion (Dyspepsia)',
    symptoms: ['Upper abdominal discomfort', 'Bloating', 'Nausea', 'Belching', 'Heartburn', 'Feeling full quickly'],
    description: 'Discomfort or pain in the upper abdomen, often related to eating.',
    selfCare: [
      'Eat smaller, more frequent meals',
      'Avoid trigger foods (spicy, fatty, acidic)',
      'Don\'t lie down immediately after eating',
      'Reduce stress',
      'Try ginger tea',
      'Avoid alcohol and smoking'
    ],
    whenToSeeDoctor: [
      'Severe or persistent pain',
      'Unintentional weight loss',
      'Difficulty swallowing',
      'Vomiting blood or black stools',
      'Chest pain'
    ],
    severity: 'low'
  },
  {
    id: '4',
    name: 'Minor Cuts & Scrapes',
    symptoms: ['Skin break', 'Bleeding', 'Pain', 'Swelling around wound'],
    description: 'Small breaks in the skin that usually heal quickly with proper care.',
    selfCare: [
      'Wash hands before treating',
      'Rinse wound with clean water',
      'Clean around wound with soap',
      'Apply antibiotic ointment',
      'Cover with sterile bandage',
      'Change dressing daily'
    ],
    whenToSeeDoctor: [
      'Deep or gaping wound',
      'Bleeding won\'t stop after 10 minutes',
      'Signs of infection (redness, warmth, pus)',
      'Wound from animal bite',
      'Tetanus shot needed'
    ],
    severity: 'low'
  },
  {
    id: '5',
    name: 'Minor Burns',
    symptoms: ['Red skin', 'Pain', 'Swelling', 'Blisters (in second degree)'],
    description: 'Damage to skin tissue caused by heat, chemicals, electricity, or radiation.',
    selfCare: [
      'Cool the burn under running water (10-20 min)',
      'Remove tight items before swelling',
      'Apply aloe vera or moisturizer',
      'Take pain relievers if needed',
      'Cover with sterile gauze',
      'Don\'t break blisters'
    ],
    whenToSeeDoctor: [
      'Burn larger than 3 inches',
      'Deep burns or charred skin',
      'Burns on face, hands, feet, or genitals',
      'Chemical or electrical burns',
      'Signs of infection'
    ],
    severity: 'medium'
  },
  {
    id: '6',
    name: 'Sprains & Strains',
    symptoms: ['Pain', 'Swelling', 'Bruising', 'Limited mobility', 'Muscle spasms'],
    description: 'Injuries to ligaments (sprains) or muscles/tendons (strains) from overstretching.',
    selfCare: [
      'Rest the injured area',
      'Ice for 15-20 minutes every 2-3 hours',
      'Compress with elastic bandage',
      'Elevate above heart level',
      'Take OTC anti-inflammatory medication',
      'Gentle stretching after 48 hours'
    ],
    whenToSeeDoctor: [
      'Severe pain or swelling',
      'Can\'t bear weight or use limb',
      'Numbness or tingling',
      'Joint looks deformed',
      'No improvement after a week'
    ],
    severity: 'medium'
  },
  {
    id: '7',
    name: 'Fever',
    symptoms: ['Temperature above 100.4°F (38°C)', 'Sweating', 'Chills', 'Headache', 'Muscle aches', 'Weakness'],
    description: 'A temporary increase in body temperature, often due to infection.',
    selfCare: [
      'Rest and sleep',
      'Stay hydrated (water, broth, juice)',
      'Wear light clothing',
      'Keep room temperature comfortable',
      'Take acetaminophen or ibuprofen',
      'Take lukewarm bath if uncomfortable'
    ],
    whenToSeeDoctor: [
      'Temperature above 103°F (39.4°C)',
      'Fever lasting more than 3 days',
      'Severe headache or stiff neck',
      'Confusion or irritability',
      'Seizure',
      'Difficulty breathing'
    ],
    severity: 'medium'
  },
  {
    id: '8',
    name: 'Diarrhea',
    symptoms: ['Loose watery stools', 'Abdominal cramps', 'Bloating', 'Nausea', 'Urgency'],
    description: 'Frequent loose or watery bowel movements, usually lasting a few days.',
    selfCare: [
      'Drink plenty of fluids (oral rehydration solution)',
      'Eat bland foods (BRAT diet: bananas, rice, applesauce, toast)',
      'Avoid dairy, fatty, and spicy foods',
      'Rest',
      'Take probiotics if available',
      'Avoid caffeine and alcohol'
    ],
    whenToSeeDoctor: [
      'Diarrhea lasting more than 2 days',
      'Signs of dehydration (dark urine, dizziness)',
      'Severe abdominal pain',
      'Blood in stool',
      'High fever'
    ],
    severity: 'medium'
  },
  {
    id: '9',
    name: 'Allergic Reaction - Mild',
    symptoms: ['Sneezing', 'Itchy eyes', 'Runny nose', 'Watery eyes', 'Nasal congestion'],
    description: 'Immune system reaction to allergens like pollen, dust, or pet dander.',
    selfCare: [
      'Avoid known allergens',
      'Use saline nasal rinse',
      'Take OTC antihistamines',
      'Use air purifier indoors',
      'Keep windows closed during high pollen',
      'Shower after being outdoors'
    ],
    whenToSeeDoctor: [
      'Symptoms don\'t improve with OTC meds',
      'Symptoms interfere with daily activities',
      'Recurring sinus infections',
      'Wheezing or shortness of breath'
    ],
    severity: 'low'
  },
  {
    id: '10',
    name: 'Insomnia',
    symptoms: ['Difficulty falling asleep', 'Waking up frequently', 'Waking too early', 'Daytime tiredness'],
    description: 'Persistent difficulty falling asleep or staying asleep.',
    selfCare: [
      'Maintain consistent sleep schedule',
      'Create relaxing bedtime routine',
      'Limit screen time before bed',
      'Avoid caffeine after noon',
      'Keep bedroom cool and dark',
      'Try relaxation techniques (meditation, deep breathing)'
    ],
    whenToSeeDoctor: [
      'Insomnia lasts more than a month',
      'Severe daytime sleepiness',
      'Sleep apnea symptoms (loud snoring, gasping)',
      'Depression or anxiety symptoms',
      'Restless leg symptoms'
    ],
    severity: 'low'
  }
];

export const firstAidGuides: FirstAidGuide[] = [
  {
    id: '1',
    emergency: 'Choking',
    steps: [
      'Encourage person to cough if able',
      'If unable to cough, perform abdominal thrusts (Heimlich maneuver)',
      'Stand behind person, wrap arms around waist',
      'Make fist above navel, grasp with other hand',
      'Pull inward and upward sharply',
      'Repeat until object is expelled'
    ],
    donts: [
      'Don\'t give water or food',
      'Don\'t perform blind finger sweeps',
      'Don\'t hit on back if person is coughing'
    ],
    callEmergency: true
  },
  {
    id: '2',
    emergency: 'Severe Bleeding',
    steps: [
      'Call emergency services immediately',
      'Apply direct pressure with clean cloth/bandage',
      'Elevate injured area above heart if possible',
      'Add more layers if blood soaks through',
      'Apply tourniquet only if life-threatening (last resort)',
      'Keep person warm and calm'
    ],
    donts: [
      'Don\'t remove soaked bandages',
      'Don\'t apply tourniquet unless necessary',
      'Don\'t give food or drink'
    ],
    callEmergency: true
  },
  {
    id: '3',
    emergency: 'Burns - Severe',
    steps: [
      'Call emergency services for large/deep burns',
      'Cool burn with running water (not ice)',
      'Remove jewelry and loose clothing',
      'Cover with sterile non-stick dressing',
      'Elevate burned area if possible',
      'Monitor for shock'
    ],
    donts: [
      'Don\'t use ice or ice water',
      'Don\'t apply butter, oil, or ointments',
      'Don\'t break blisters',
      'Don\'t remove clothing stuck to skin'
    ],
    callEmergency: true
  },
  {
    id: '4',
    emergency: 'Fainting',
    steps: [
      'Lay person flat on their back',
      'Elevate legs above heart level',
      'Loosen tight clothing',
      'Ensure fresh air',
      'Check breathing and pulse',
      'If vomiting, turn on side'
    ],
    donts: [
      'Don\'t give food or drink immediately',
      'Don\'t let them get up too quickly',
      'Don\'t crowd around'
    ],
    callEmergency: false
  },
  {
    id: '5',
    emergency: 'Nosebleed',
    steps: [
      'Sit upright and lean forward',
      'Pinch soft part of nose (below bridge)',
      'Hold for 10-15 minutes',
      'Breathe through mouth',
      'Apply cold compress to nose/cheeks',
      'Don\'t check too early'
    ],
    donts: [
      'Don\'t tilt head back',
      'Don\'t stuff tissues deep into nose',
      'Don\'t blow nose after bleeding stops'
    ],
    callEmergency: false
  },
  {
    id: '6',
    emergency: 'Seizure',
    steps: [
      'Clear area of dangerous objects',
      'Place something soft under head',
      'Turn person on side (recovery position)',
      'Time the seizure',
      'Stay calm and reassure',
      'Stay until fully conscious'
    ],
    donts: [
      'Don\'t restrain person',
      'Don\'t put anything in mouth',
      'Don\'t give food or water',
      'Don\'t move unless in danger'
    ],
    callEmergency: true
  },
  {
    id: '7',
    emergency: 'Heat Exhaustion',
    steps: [
      'Move to cool place',
      'Remove excess clothing',
      'Apply cool wet cloths to skin',
      'Give cool (not cold) water to drink',
      'Fan person while moistening skin',
      'Rest in cool place'
    ],
    donts: [
      'Don\'t give alcohol or caffeine',
      'Don\'t use ice-cold water',
      'Don\'t leave alone'
    ],
    callEmergency: false
  },
  {
    id: '8',
    emergency: 'Fracture (Broken Bone)',
    steps: [
      'Call emergency services if severe',
      'Don\'t move the injured area',
      'Immobilize with splint if trained',
      'Apply ice wrapped in cloth',
      'Elevate if possible',
      'Check circulation beyond injury'
    ],
    donts: [
      'Don\'t try to straighten bone',
      'Don\'t apply ice directly',
      'Don\'t give food or drink',
      'Don\'t move unnecessarily'
    ],
    callEmergency: true
  }
];

export const healthTips: HealthTip[] = [
  {
    id: '1',
    category: 'nutrition',
    title: 'Stay Hydrated',
    content: 'Drink at least 8 glasses (2 liters) of water daily. Proper hydration improves energy, brain function, and helps regulate body temperature.'
  },
  {
    id: '2',
    category: 'nutrition',
    title: 'Eat the Rainbow',
    content: 'Include colorful fruits and vegetables in your diet. Different colors provide different nutrients - red for heart health, orange for immunity, green for detox, blue/purple for brain health.'
  },
  {
    id: '3',
    category: 'exercise',
    title: '150 Minutes Weekly',
    content: 'Aim for at least 150 minutes of moderate aerobic activity per week. This can be 30 minutes of brisk walking 5 days a week. Regular exercise reduces risk of chronic diseases.'
  },
  {
    id: '4',
    category: 'sleep',
    title: 'Sleep Hygiene',
    content: 'Adults need 7-9 hours of sleep. Maintain a consistent sleep schedule, even on weekends. Poor sleep is linked to obesity, heart disease, and depression.'
  },
  {
    id: '5',
    category: 'mental',
    title: 'Stress Management',
    content: 'Practice daily stress-reduction techniques: deep breathing, meditation, yoga, or journaling. Chronic stress weakens the immune system and increases disease risk.'
  },
  {
    id: '6',
    category: 'prevention',
    title: 'Hand Washing',
    content: 'Wash hands for 20 seconds with soap and water. This simple act prevents 30% of diarrhea-related sicknesses and 20% of respiratory infections.'
  },
  {
    id: '7',
    category: 'nutrition',
    title: 'Limit Added Sugar',
    content: 'Keep added sugars under 25g (women) or 36g (men) daily. Excess sugar contributes to obesity, diabetes, and heart disease. Check food labels carefully.'
  },
  {
    id: '8',
    category: 'exercise',
    title: 'Break Up Sitting Time',
    content: 'Stand up and move every 30 minutes. Prolonged sitting increases risk of heart disease, diabetes, and premature death even if you exercise regularly.'
  },
  {
    id: '9',
    category: 'prevention',
    title: 'Sun Protection',
    content: 'Use SPF 30+ sunscreen daily, even on cloudy days. UV exposure causes 90% of skin aging and increases skin cancer risk. Reapply every 2 hours outdoors.'
  },
  {
    id: '10',
    category: 'mental',
    title: 'Social Connection',
    content: 'Maintain strong social connections. Loneliness is as harmful as smoking 15 cigarettes daily. Regular social interaction improves longevity and mental health.'
  },
  {
    id: '11',
    category: 'nutrition',
    title: 'Fiber Intake',
    content: 'Aim for 25-30g of fiber daily from whole grains, fruits, vegetables, and legumes. Fiber aids digestion, controls blood sugar, and lowers cholesterol.'
  },
  {
    id: '12',
    category: 'prevention',
    title: 'Regular Checkups',
    content: 'See your doctor annually for preventive care. Early detection of conditions like high blood pressure, diabetes, and cancer significantly improves outcomes.'
  }
];

// Symptom checker mapping
export const symptomChecker: Record<string, string[]> = {
  'fever': ['Common Cold', 'Flu', 'COVID-19', 'Infection'],
  'headache': ['Tension Headache', 'Migraine', 'Sinusitis', 'Dehydration'],
  'cough': ['Common Cold', 'Bronchitis', 'Allergies', 'Asthma'],
  'chest pain': ['Heart Attack (EMERGENCY)', 'Angina', 'Muscle Strain', 'Anxiety'],
  'stomach pain': ['Indigestion', 'Appendicitis', 'Gastritis', 'Food Poisoning'],
  'rash': ['Allergic Reaction', 'Contact Dermatitis', 'Eczema', 'Infection'],
  'shortness of breath': ['Asthma', 'Anxiety', 'Heart Failure', 'Pneumonia'],
  'dizziness': ['Vertigo', 'Low Blood Pressure', 'Dehydration', 'Anemia'],
  'nausea': ['Food Poisoning', 'Motion Sickness', 'Migraine', 'Pregnancy'],
  'fatigue': ['Anemia', 'Thyroid Issues', 'Depression', 'Sleep Apnea']
};

// Emergency keywords
export const emergencyKeywords = [
  'chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'not breathing',
  'unconscious', 'severe bleeding', 'seizure', 'poisoning', 'overdose',
  'suicide', 'choking', 'drowning', 'severe burn', 'head injury',
  'broken bone', 'fracture', 'allergic reaction', 'anaphylaxis'
];

// Offline chat responses
export const offlineResponses: Record<string, string> = {
  'greeting': 'Hello! I\'m your offline healthcare assistant. I can help with general health information, first aid guidance, symptom checking, and health tips. How can I assist you today?',
  'emergency': '⚠️ This sounds like a medical emergency. Please call emergency services (911 in US) immediately or go to the nearest emergency room.',
  'unknown': 'I\'m not sure about that specific query. I can help with:\n• Common health conditions\n• First aid guidance\n• General symptom information\n• Health and wellness tips\n• When to see a doctor\n\nPlease try rephrasing or ask about a specific health topic.',
  'offline': 'I\'m currently operating in offline mode. I have access to general health information, but for personalized medical advice, please consult a healthcare provider or connect to the internet for full functionality.'
};
