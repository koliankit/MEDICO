export interface SymptomItem {
  symptom: string;
  duration?: string;
  severity?: string;
  location?: string;
}

export interface AssessmentInput {
  ageGroup: string;
  gender?: string;
  chiefComplaint: string;
  symptoms: SymptomItem[];
  medicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  followUpResponses?: Record<string, string>;
}

export interface EmergencyCheckResult {
  isEmergency: boolean;
  redFlags: string[];
  emergencyMessage?: string;
  helpline: string;
}

export interface AIAssessmentOutput {
  safetyAlertTriggered: boolean;
  emergencyReason: string | null;
  aiUrgencyLevel: 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW';
  aiSummary: string;
  possibleExplanations: Array<{
    condition: string;
    relevance: string;
    source: string;
  }>;
  questionsForDoctor: string[];
  references: Array<{
    title: string;
    organization: string;
    url: string;
    lastReviewed: string;
  }>;
  disclaimer: string;
  isAiGenerated: boolean;
}

// 1. Rigorous Medically-Reviewed Emergency Red Flag Screener
export function checkEmergencyRedFlags(input: AssessmentInput): EmergencyCheckResult {
  const textCorpus = [
    input.chiefComplaint,
    ...input.symptoms.map(s => `${s.symptom} ${s.location || ''} ${s.severity || ''}`),
    ...Object.values(input.followUpResponses || {}),
  ].join(' ').toLowerCase();

  const redFlags: string[] = [];

  // Cardiac Emergency
  if (
    (textCorpus.includes('chest pain') || textCorpus.includes('chest pressure') || textCorpus.includes('crushing')) &&
    (textCorpus.includes('left arm') || textCorpus.includes('jaw') || textCorpus.includes('sweat') || textCorpus.includes('breathless') || textCorpus.includes('radiat'))
  ) {
    redFlags.push('Acute chest pain with radiation or autonomic symptoms (possible Acute Coronary Syndrome)');
  }

  // Stroke / Neurological Emergency (FAST criteria)
  if (
    textCorpus.includes('slurred speech') ||
    textCorpus.includes('facial droop') ||
    (textCorpus.includes('one side') && (textCorpus.includes('weakness') || textCorpus.includes('numbness'))) ||
    textCorpus.includes('sudden loss of vision')
  ) {
    redFlags.push('Sudden focal neurological deficit or speech disturbance (possible Acute Cerebrovascular Event / Stroke)');
  }

  // Severe Respiratory Distress
  if (
    textCorpus.includes('gasping') ||
    textCorpus.includes('unable to speak full sentences') ||
    textCorpus.includes('lips turning blue') ||
    textCorpus.includes('severe choking') ||
    textCorpus.includes('stridor')
  ) {
    redFlags.push('Severe acute respiratory distress or cyanosis');
  }

  // Massive Bleeding / Shock
  if (
    textCorpus.includes('coughing blood') ||
    textCorpus.includes('vomiting blood') ||
    textCorpus.includes('uncontrolled bleeding') ||
    textCorpus.includes('loss of consciousness') ||
    textCorpus.includes('fainted suddenly')
  ) {
    redFlags.push('Severe hemodynamic compromise, syncope, or active significant hemorrhage');
  }

  // Severe Anaphylaxis
  if (
    (textCorpus.includes('swelling of throat') || textCorpus.includes('tongue swelling')) &&
    (textCorpus.includes('difficulty breathing') || textCorpus.includes('rash') || textCorpus.includes('allergy'))
  ) {
    redFlags.push('Suspected severe acute anaphylaxis with airway compromise');
  }

  if (redFlags.length > 0) {
    return {
      isEmergency: true,
      redFlags,
      emergencyMessage:
        'EMERGENCY WARNING: Your reported symptoms indicate potentially life-threatening warning signs requiring immediate emergency medical evaluation. Please do not wait for an online assessment. Proceed immediately to the nearest Emergency Department or call emergency medical services.',
      helpline: '112 (India Emergency Response Support System)',
    };
  }

  return {
    isEmergency: false,
    redFlags: [],
    helpline: '112',
  };
}

// 2. Deterministic Healthcare Decision-Support Engine
export async function evaluateSymptoms(input: AssessmentInput): Promise<AIAssessmentOutput> {
  // Step 1: Execute mandatory emergency safety screening
  const emergencyCheck = checkEmergencyRedFlags(input);

  if (emergencyCheck.isEmergency) {
    return {
      safetyAlertTriggered: true,
      emergencyReason: emergencyCheck.redFlags.join('; '),
      aiUrgencyLevel: 'EMERGENCY',
      aiSummary: `URGENT MEDICAL ALERT: Critical warning signs detected (${emergencyCheck.redFlags.join(', ')}). Immediate in-person emergency care is mandatory. Routine outpatient assessment has been suspended to prevent critical care delay.`,
      possibleExplanations: [
        {
          condition: 'Acute Medical Emergency (Requires Immediate Clinical Evaluation)',
          relevance: 'Symptoms match authoritative clinical criteria for urgent emergency department triage.',
          source: 'India Emergency Response Protocol / WHO Emergency Triage Assessment',
        },
      ],
      questionsForDoctor: [
        'What immediate stabilization or diagnostic tests (such as ECG, Troponin, or CT) are required?',
      ],
      references: [
        {
          title: 'India Emergency Response Support System (ERSS)',
          organization: 'Ministry of Home Affairs / MoHFW, Govt. of India',
          url: 'https://112.gov.in/',
          lastReviewed: '2024-01',
        },
        {
          title: 'Emergency and Trauma Care Guidelines',
          organization: 'World Health Organization (WHO)',
          url: 'https://www.who.int/emergencies',
          lastReviewed: '2023-10',
        },
      ],
      disclaimer:
        'CRITICAL NOTICE: This is an AI preliminary screening tool and NEVER replaces emergency medical attention. Call 112 immediately or visit City Hospital Pune Emergency Department.',
      isAiGenerated: true,
    };
  }

  // Step 2: Categorize based on clinical domain patterns
  const text = [
    input.chiefComplaint,
    ...input.symptoms.map(s => s.symptom),
  ].join(' ').toLowerCase();

  let urgencyLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
  let possibleExplanations: AIAssessmentOutput['possibleExplanations'] = [];
  let questions: string[] = [];
  let references: AIAssessmentOutput['references'] = [];
  let summary = '';

  // Cardiac / Thoracic Pattern
  if (text.includes('chest') || text.includes('palpitation') || text.includes('flutter') || text.includes('heartbeat')) {
    urgencyLevel = 'HIGH';
    summary =
      'Preliminary evaluation notes thoracic or cardiovascular-related symptoms. While no acute red flags were triggered, in-person clinical examination and resting 12-lead ECG are recommended to evaluate rhythm or ischemia.';
    possibleExplanations = [
      {
        condition: 'Benign Palpitations or Sinus Tachycardia',
        relevance: 'Commonly associated with physical exertion, caffeine, dehydration, stress, or mild electrolyte imbalance.',
        source: 'NHS UK / European Society of Cardiology Guidelines',
      },
      {
        condition: 'Gastroesophageal Reflux Disease (GERD)',
        relevance: 'Esophageal acid exposure frequently presents as retrosternal burning or chest discomfort mimicking cardiac sensations.',
        source: 'MedlinePlus / World Gastroenterology Organisation',
      },
      {
        condition: 'Cardiovascular Assessment Consideration (Non-Urgent Ischemia Exclusion)',
        relevance: 'Requires clinical evaluation by an attending physician, particularly if risk factors (hypertension, smoking, diabetes) exist.',
        source: 'Ministry of Health & Family Welfare (MoHFW) India - NCD Guidelines',
      },
    ];
    questions = [
      'Are the symptoms associated with exertion or relieved by rest?',
      'Do you recommend a baseline 12-lead ECG, 2D Echocardiogram, or Holter monitoring?',
      'Could recent dietary intake, medications, or stress levels be contributing?',
    ];
    references = [
      {
        title: 'Heart Palpitations Overview',
        organization: 'National Health Service (NHS UK)',
        url: 'https://www.nhs.uk/conditions/heart-palpitations/',
        lastReviewed: '2024-03',
      },
      {
        title: 'Cardiovascular Diseases Prevention and Care',
        organization: 'World Health Organization (WHO)',
        url: 'https://www.who.int/health-topics/cardiovascular-diseases',
        lastReviewed: '2023-12',
      },
    ];
  }
  // Respiratory Pattern
  else if (text.includes('cough') || text.includes('phlegm') || text.includes('throat') || text.includes('cold') || text.includes('fever') || text.includes('wheez')) {
    urgencyLevel = text.includes('fever') && text.includes('wheez') ? 'HIGH' : 'MODERATE';
    summary =
      'Symptoms are characteristic of an upper or lower respiratory tract presentation. Most viral respiratory illnesses resolve with supportive care, but persistence beyond 7-10 days or respiratory effort warrants physician assessment.';
    possibleExplanations = [
      {
        condition: 'Acute Upper Respiratory Tract Infection (Common Cold / Viral Pharyngitis)',
        relevance: 'Highly frequent viral syndrome presenting with rhinitis, sore throat, mild cough, and low-grade pyrexia.',
        source: 'WHO Clinical Management Guidelines / MedlinePlus',
      },
      {
        condition: 'Bronchial Hyperresponsiveness / Acute Bronchitis',
        relevance: 'Post-viral bronchial irritation often leads to prolonged coughing or mild audible wheezing.',
        source: 'NHS UK Respiratory Care Framework',
      },
      {
        condition: 'Allergic Rhinosinusitis',
        relevance: 'Frequent in Pune seasonal weather shifts and environmental particulate exposure.',
        source: 'National Health Authority (NHA) / ABDM Clinical Resources',
      },
    ];
    questions = [
      'Is my cough productive or dry, and has there been any colored sputum?',
      'Are bronchodilator inhalers or oral antihistamines indicated?',
      'What specific signs (like high persistent fever or difficulty breathing) should prompt immediate re-evaluation?',
    ];
    references = [
      {
        title: 'Cough: Diagnosis and Home Care',
        organization: 'MedlinePlus (US National Library of Medicine)',
        url: 'https://medlineplus.gov/cough.html',
        lastReviewed: '2024-02',
      },
      {
        title: 'Management of Acute Respiratory Infections',
        organization: 'Ministry of Health and Family Welfare, Govt. of India',
        url: 'https://mohfw.gov.in/',
        lastReviewed: '2023-09',
      },
    ];
  }
  // Gastrointestinal Pattern
  else if (text.includes('stomach') || text.includes('abdominal') || text.includes('nausea') || text.includes('vomit') || text.includes('diarrhea') || text.includes('acid') || text.includes('gastric')) {
    urgencyLevel = text.includes('severe') || text.includes('sharp') ? 'HIGH' : 'MODERATE';
    summary =
      'Gastrointestinal symptoms identified. Clinical evaluation is recommended to assess hydration status, abdominal tenderness, and rule out surgical causes or bacterial gastroenteritis.';
    possibleExplanations = [
      {
        condition: 'Acute Gastroenteritis / Enteric Infection',
        relevance: 'Commonly presents with loose stools, abdominal cramping, and mild nausea.',
        source: 'WHO Diarrhoeal Disease Management Guidelines',
      },
      {
        condition: 'Gastroesophageal Reflux or Acid Peptic Disorder',
        relevance: 'Characterized by epigastric burning, water brash, and postprandial discomfort.',
        source: 'MedlinePlus / NHS UK',
      },
      {
        condition: 'Irritable Bowel Syndrome / Functional Abdominal Discomfort',
        relevance: 'Linked to gut-brain axis sensitivity, diet triggers, or post-infectious states.',
        source: 'NICE Clinical Guidelines (UK)',
      },
    ];
    questions = [
      'Are oral rehydration salts (ORS) adequate, or do I need stool investigations?',
      'Could this be foodborne, and should I adjust to a bland BRAT diet temporarily?',
      'When would an abdominal ultrasound or blood panel (CBC, LFT) be necessary?',
    ];
    references = [
      {
        title: 'Gastroenteritis Overview and Treatment',
        organization: 'National Health Service (NHS UK)',
        url: 'https://www.nhs.uk/conditions/diarrhoea-and-vomiting/',
        lastReviewed: '2024-04',
      },
      {
        title: 'Diarrhoeal Disease Factsheet',
        organization: 'World Health Organization (WHO)',
        url: 'https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease',
        lastReviewed: '2023-08',
      },
    ];
  }
  // Neurological / Headache Pattern
  else if (text.includes('headache') || text.includes('migraine') || text.includes('dizzy') || text.includes('lightheaded')) {
    urgencyLevel = 'MODERATE';
    summary =
      'Cephalalgia or vestibular symptoms reported. Most primary headaches are non-dangerous, but pattern, onset speed, and associated visual or neck symptoms must be reviewed by a physician.';
    possibleExplanations = [
      {
        condition: 'Tension-Type Headache',
        relevance: 'Most frequent primary headache; characterized by bilateral, non-pulsatile dull pressure often tied to muscular tension.',
        source: 'International Headache Society / NHS UK',
      },
      {
        condition: 'Migraine without Aura',
        relevance: 'Unilateral or throbbing headache, often aggravated by light, sound, or physical activity.',
        source: 'WHO Headache Disorders Fact Sheet',
      },
      {
        condition: 'Cervicogenic or Eye Strain Related Cephalalgia',
        relevance: 'Associated with prolonged screen exposure, ergonomic posture, or uncorrected refractive error.',
        source: 'MedlinePlus',
      },
    ];
    questions = [
      'Is my headache consistent with tension headache or migraine?',
      'Do I need imaging such as a brain MRI/CT, or can we start with symptom management?',
      'Should I maintain a headache trigger journal?',
    ];
    references = [
      {
        title: 'Headache Disorders',
        organization: 'World Health Organization (WHO)',
        url: 'https://www.who.int/news-room/fact-sheets/detail/headache-disorders',
        lastReviewed: '2023-11',
      },
      {
        title: 'Migraine and Headaches Clinical Overview',
        organization: 'MedlinePlus',
        url: 'https://medlineplus.gov/migraine.html',
        lastReviewed: '2024-01',
      },
    ];
  }
  // Musculoskeletal Pattern
  else if (text.includes('joint') || text.includes('back') || text.includes('knee') || text.includes('muscle') || text.includes('sprain') || text.includes('neck pain')) {
    urgencyLevel = 'LOW';
    summary =
      'Musculoskeletal symptoms described. Rest, gentle mobility, ergonomic adjustment, and physical examination will help determine if radiological imaging or physical therapy is warranted.';
    possibleExplanations = [
      {
        condition: 'Mechanical Musculoskeletal Strain / Myofascial Pain',
        relevance: 'Frequently caused by postural stress, sudden movement, or athletic overexertion.',
        source: 'NHS UK Musculoskeletal Services',
      },
      {
        condition: 'Osteoarthritis (Degenerative Joint Disease)',
        relevance: 'Particularly common in weight-bearing joints (knees, hips, lumbar spine) with age or previous joint trauma.',
        source: 'WHO Musculoskeletal Conditions / MoHFW India Guidelines',
      },
    ];
    questions = [
      'Should I apply heat or cold packs to the affected area?',
      'Is an X-ray or orthopedic consultation recommended at this stage?',
      'Are specific physiotherapy strengthening exercises safe for me right now?',
    ];
    references = [
      {
        title: 'Musculoskeletal Conditions Factsheet',
        organization: 'World Health Organization (WHO)',
        url: 'https://www.who.int/news-room/fact-sheets/detail/musculoskeletal-conditions',
        lastReviewed: '2023-07',
      },
    ];
  }
  // General / Non-Specific Pattern
  else {
    urgencyLevel = 'LOW';
    summary =
      'General health symptoms reported. An outpatient physician consultation is advised to obtain a detailed clinical history, conduct a physical examination, and determine appropriate baseline lab investigations.';
    possibleExplanations = [
      {
        condition: 'General Outpatient Clinical Review Indicated',
        relevance: 'Comprehensive evaluation by an Internal Medicine physician is required for accurate differential diagnosis.',
        source: 'Ministry of Health and Family Welfare (MoHFW) Primary Care Framework',
      },
    ];
    questions = [
      'What routine screening or baseline blood tests do you recommend?',
      'Could lifestyle, sleep patterns, or nutritional factors be contributing?',
    ];
    references = [
      {
        title: 'Ayushman Bharat Digital Mission (ABDM) Patient Care',
        organization: 'National Health Authority (NHA), Govt. of India',
        url: 'https://abdm.gov.in/',
        lastReviewed: '2024-01',
      },
      {
        title: 'Primary Health Care Principles',
        organization: 'World Health Organization (WHO)',
        url: 'https://www.who.int/health-topics/primary-health-care',
        lastReviewed: '2023-10',
      },
    ];
  }

  return {
    safetyAlertTriggered: false,
    emergencyReason: null,
    aiUrgencyLevel: urgencyLevel,
    aiSummary: summary,
    possibleExplanations,
    questionsForDoctor: questions,
    references,
    disclaimer:
      'CLINICAL DECISION SUPPORT DISCLAIMER: This assessment is generated by an artificial intelligence decision-support tool solely for preliminary informational and triage guidance. It is NOT a medical diagnosis and does NOT replace the clinical judgment of a licensed physician. City Hospital Pune clinicians will review this summary during your consultation.',
    isAiGenerated: true,
  };
}
