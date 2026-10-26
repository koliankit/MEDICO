import {
  Department,
  Doctor,
  HealthArticle,
  User,
  UserRole,
  LabCatalogItem,
  LabOrder,
  Appointment,
  TriageRecord,
  SymptomAssessment,
  NotificationItem,
  AuditEvent,
} from '../types';

// 1. Departments
export const mockDepartments: Department[] = [
  {
    id: 'dept-gen-med',
    name: 'General Medicine & Internal Care',
    code: 'GEN-MED',
    description: 'Comprehensive adult primary care, acute disease diagnosis, and chronic disease management.',
    icon: 'Stethoscope',
    floor: 'Floor 1, Wing A',
    doctorCount: 1,
  },
  {
    id: 'dept-cardio',
    name: 'Cardiology & Cardiac Sciences',
    code: 'CARDIO',
    description: 'Advanced cardiovascular care, echocardiography, cardiac intervention, and preventive cardiology.',
    icon: 'HeartPulse',
    floor: 'Floor 2, Wing B',
    doctorCount: 1,
  },
  {
    id: 'dept-neuro',
    name: 'Neurology & Neuro-Sciences',
    code: 'NEURO',
    description: 'Diagnosis and management of neurological disorders, stroke care, epilepsy, and peripheral neuropathy.',
    icon: 'Brain',
    floor: 'Floor 3, Wing A',
    doctorCount: 1,
  },
  {
    id: 'dept-ortho',
    name: 'Orthopedics & Joint Replacement',
    code: 'ORTHO',
    description: 'Comprehensive bone, joint, musculoskeletal trauma, arthroscopy, and spine care.',
    icon: 'Bone',
    floor: 'Floor 2, Wing C',
    doctorCount: 1,
  },
  {
    id: 'dept-pediatrics',
    name: 'Pediatrics & Neonatal Care',
    code: 'PEDIATRICS',
    description: 'Specialized healthcare for infants, children, and adolescents with developmental surveillance.',
    icon: 'Baby',
    floor: 'Floor 1, Wing C',
    doctorCount: 1,
  },
  {
    id: 'dept-pulmo',
    name: 'Pulmonology & Respiratory Medicine',
    code: 'PULMO',
    description: 'Asthma, COPD, lung infections, post-COVID respiratory monitoring, and allergy management.',
    icon: 'Wind',
    floor: 'Floor 3, Wing B',
    doctorCount: 1,
  },
];

// 2. Doctors
export const mockDoctors: Doctor[] = [
  {
    id: 'doc-cardio-1',
    userId: 'user-doc-anita',
    licenseNumber: 'MCI-MH-45892',
    departmentId: 'dept-cardio',
    department: mockDepartments[1],
    specialization: 'Senior Consultant Interventional Cardiologist',
    qualifications: 'MBBS, MD (Medicine), DM (Cardiology), FESC',
    experienceYears: 16,
    consultationFee: 1200.0,
    roomNumber: 'OPD-204',
    bio: 'Specialist in ischemic heart disease, cardiac rhythm management, coronary angiography, and hypertension clinic.',
    isAvailable: true,
    availability: JSON.stringify(['Mon 09:30-13:30', 'Tue 09:30-13:30', 'Thu 14:00-18:00', 'Fri 09:30-13:30']),
    user: {
      firstName: 'Anita',
      lastName: 'Joshi',
      email: 'dr.anita@cityhospitalpune.org',
      phone: '+91 98221 23456',
    },
  },
  {
    id: 'doc-gen-1',
    userId: 'user-doc-rajesh',
    licenseNumber: 'MCI-MH-38910',
    departmentId: 'dept-gen-med',
    department: mockDepartments[0],
    specialization: 'Consultant Physician & Diabetologist',
    qualifications: 'MBBS, MD (Internal Medicine), PG Diab (Boston)',
    experienceYears: 18,
    consultationFee: 900.0,
    roomNumber: 'OPD-102',
    bio: 'Extensive expertise in metabolic syndrome, lifestyle disorders, infectious diseases, and holistic adult medicine.',
    isAvailable: true,
    availability: JSON.stringify(['Mon 09:00-14:00', 'Wed 09:00-14:00', 'Thu 09:00-14:00', 'Sat 10:00-15:00']),
    user: {
      firstName: 'Rajesh',
      lastName: 'Kulkarni',
      email: 'dr.rajesh@cityhospitalpune.org',
      phone: '+91 98221 34567',
    },
  },
  {
    id: 'doc-neuro-1',
    userId: 'user-doc-vikram',
    licenseNumber: 'MCI-MH-51204',
    departmentId: 'dept-neuro',
    department: mockDepartments[2],
    specialization: 'Consultant Neurologist & Stroke Specialist',
    qualifications: 'MBBS, MD (Med), DM (Neurology), FINR',
    experienceYears: 12,
    consultationFee: 1400.0,
    roomNumber: 'OPD-305',
    bio: 'Specialist in migraine syndromes, acute neuro-vascular emergencies, neuromuscular disorders, and electrophysiology.',
    isAvailable: true,
    availability: JSON.stringify(['Tue 10:00-14:00', 'Wed 14:00-18:00', 'Fri 10:00-14:00']),
    user: {
      firstName: 'Vikram',
      lastName: 'Deshmukh',
      email: 'dr.vikram@cityhospitalpune.org',
      phone: '+91 98221 45678',
    },
  },
  {
    id: 'doc-ortho-1',
    userId: 'user-doc-sunita',
    licenseNumber: 'MCI-MH-42991',
    departmentId: 'dept-ortho',
    department: mockDepartments[3],
    specialization: 'Orthopedic & Joint Replacement Surgeon',
    qualifications: 'MBBS, MS (Ortho), Fellowship in Arthroplasty (UK)',
    experienceYears: 15,
    consultationFee: 1100.0,
    roomNumber: 'OPD-210',
    bio: 'Expertise in knee and hip arthroplasty, sports ligament reconstructions, and osteoporosis care.',
    isAvailable: true,
    availability: JSON.stringify(['Mon 10:00-15:00', 'Wed 10:00-15:00', 'Fri 14:00-18:00']),
    user: {
      firstName: 'Sunita',
      lastName: 'Patwardhan',
      email: 'dr.sunita@cityhospitalpune.org',
      phone: '+91 98221 56789',
    },
  },
  {
    id: 'doc-ped-1',
    userId: 'user-doc-rohan',
    licenseNumber: 'MCI-MH-60312',
    departmentId: 'dept-pediatrics',
    department: mockDepartments[4],
    specialization: 'Consultant Pediatrician & Neonatologist',
    qualifications: 'MBBS, DNB (Pediatrics), Fellowship in Neonatal Intensive Care',
    experienceYears: 10,
    consultationFee: 850.0,
    roomNumber: 'OPD-114',
    bio: 'Passionate about pediatric preventive health, immunization, growth tracking, and childhood infections.',
    isAvailable: true,
    availability: JSON.stringify(['Mon 09:00-13:00', 'Tue 09:00-13:00', 'Thu 09:00-13:00', 'Sat 09:00-13:00']),
    user: {
      firstName: 'Rohan',
      lastName: 'Mehta',
      email: 'dr.rohan@cityhospitalpune.org',
      phone: '+91 98221 67890',
    },
  },
  {
    id: 'doc-pulmo-1',
    userId: 'user-doc-priya',
    licenseNumber: 'MCI-MH-47812',
    departmentId: 'dept-pulmo',
    department: mockDepartments[5],
    specialization: 'Consultant Pulmonologist & Sleep Specialist',
    qualifications: 'MBBS, MD (Pulmonary Medicine), FAPSR',
    experienceYears: 13,
    consultationFee: 1000.0,
    roomNumber: 'OPD-312',
    bio: 'Expert in adult asthma, interstitial lung diseases, obstructive sleep apnea, and bronchoscopy.',
    isAvailable: true,
    availability: JSON.stringify(['Tue 11:00-16:00', 'Thu 11:00-16:00', 'Sat 10:00-14:00']),
    user: {
      firstName: 'Priya',
      lastName: 'Shinde',
      email: 'dr.priya@cityhospitalpune.org',
      phone: '+91 98221 78901',
    },
  },
];

// Link doctors inside departments
mockDepartments.forEach((dept) => {
  dept.doctors = mockDoctors.filter((doc) => doc.departmentId === dept.id);
});

// 3. Health Education Articles
export const mockArticles: HealthArticle[] = [
  {
    id: 'edu-01',
    title: 'Recognizing Acute Cardiac Symptoms and Time-Critical Care',
    category: 'Cardiology',
    sourceOrganization: 'Ministry of Health and Family Welfare, Govt. of India',
    sourceUrl: 'https://mohfw.gov.in/',
    publicationDate: '2023-11-15',
    verificationDate: '2026-03-01',
    reviewStatus: 'Medically Reviewed by Clinical Panel',
    summary:
      'Cardiovascular disease remains the leading cause of mortality globally and in India. Early recognition of ischemic warning signs—such as retrosternal pressure, radiation to left arm or jaw, unexplained diaphoresis, and sudden dyspnea—allows rapid intervention within the "golden hour."',
    keyPoints: [
      'Call 112 immediately in India if crushing chest pain radiates to left arm or jaw with cold sweats.',
      'Do not attempt to drive yourself to the hospital during suspected cardiac distress.',
      'Control known modifiable risk factors: blood pressure (< 130/80 mmHg), LDL cholesterol, and smoking cessation.',
    ],
  },
  {
    id: 'edu-02',
    title: 'Ayushman Bharat Digital Mission (ABDM) & Your ABHA Health ID',
    category: 'Digital Health & ABDM',
    sourceOrganization: 'National Health Authority (NHA), Govt. of India',
    sourceUrl: 'https://abdm.gov.in/',
    publicationDate: '2024-01-10',
    verificationDate: '2026-02-15',
    reviewStatus: 'Official Government Clinical Guidance',
    summary:
      'The Ayushman Bharat Health Account (ABHA) is a 14-digit unique identifier that enables citizens to store, manage, and share electronic health records seamlessly across verified healthcare providers in India with explicit patient consent under the DPDP Act.',
    keyPoints: [
      'Your health records remain completely under your consent and control.',
      'Eliminates the risk of losing physical diagnostic reports or prescription slips.',
      'Interoperable across hospitals, diagnostic centers, and clinics throughout India.',
    ],
  },
  {
    id: 'edu-03',
    title: 'Hypertension Management: DASH Diet and Lifestyle Interventions',
    category: 'Preventive Medicine',
    sourceOrganization: 'World Health Organization (WHO)',
    sourceUrl: 'https://www.who.int/health-topics/hypertension',
    publicationDate: '2023-09-20',
    verificationDate: '2026-01-28',
    reviewStatus: 'Peer-Reviewed WHO Technical Series',
    summary:
      'High blood pressure is often termed the "silent killer" because it frequently produces no early symptoms until target organ damage occurs. Dietary sodium reduction, potassium-rich nutrition (DASH diet), and regular physical exercise significantly reduce cardiovascular event risk.',
    keyPoints: [
      'Target daily sodium intake below 2,000 mg (approximately 1 teaspoon of table salt).',
      'Engage in at least 150 minutes of moderate-intensity aerobic exercise per week.',
      'Maintain home blood pressure monitoring logs for your attending physician.',
    ],
  },
  {
    id: 'edu-04',
    title: 'Understanding Common Cold vs. Influenza vs. Respiratory Infections',
    category: 'Respiratory Health',
    sourceOrganization: 'National Health Service (NHS UK)',
    sourceUrl: 'https://www.nhs.uk/conditions/common-cold/',
    publicationDate: '2024-02-18',
    verificationDate: '2026-02-10',
    reviewStatus: 'Clinically Verified by NHS Primary Care Group',
    summary:
      'Distinguishing between mild viral upper respiratory tract infections and conditions requiring antimicrobial or supportive hospital care. Antibiotics do not cure viral infections and should never be taken without formal prescription.',
    keyPoints: [
      'Hydration, rest, and warm saline gargles remain the cornerstone of uncomplicated viral recovery.',
      'Red flags requiring urgent review include persistent high fever (>102°F) beyond 3 days, breathlessness, or chest pain.',
      'Never use leftover antibiotics for routine seasonal colds.',
    ],
  },
  {
    id: 'edu-05',
    title: 'Type 2 Diabetes: Glycemic Targets and Preventing Microvascular Complications',
    category: 'Endocrinology & Metabolism',
    sourceOrganization: 'MedlinePlus (US National Library of Medicine)',
    sourceUrl: 'https://medlineplus.gov/diabetes.html',
    publicationDate: '2024-01-05',
    verificationDate: '2026-03-05',
    reviewStatus: 'Reviewed by National Institutes of Health (NIH)',
    summary:
      'Consistent glycemic control measured via quarterly HbA1c testing dramatically decreases the incidence of diabetic retinopathy, nephropathy, and peripheral neuropathy. A multidisciplinary approach combining dietary fiber, exercise, and prescribed medications is essential.',
    keyPoints: [
      'Target HbA1c for most non-pregnant adults is typically under 7.0%, personalized by your physician.',
      'Annual dilated eye exams and urine microalbumin testing are recommended for all diabetic patients.',
      'Inspect feet daily for cuts, blisters, or loss of sensation.',
    ],
  },
  {
    id: 'edu-06',
    title: 'Emergency Medical Helplines & Response in Maharashtra & India',
    category: 'Emergency Medicine',
    sourceOrganization: 'India Emergency Response Support System (ERSS)',
    sourceUrl: 'https://112.gov.in/',
    publicationDate: '2024-01-01',
    verificationDate: '2026-01-01',
    reviewStatus: 'National Standard Protocol',
    summary:
      'Dial 112 for all-in-one emergency response across India (Police, Fire, and Ambulance). In medical crises, immediate notification of emergency dispatchers saves vital minutes for paramedic dispatch.',
    keyPoints: [
      '112 is toll-free and accessible even on phones without an active SIM card balance.',
      'State your precise location, landmarks in Pune, and primary patient condition clearly to the operator.',
      'City Hospital Pune Emergency OPD operates 24x7 with dedicated cardiac and trauma resuscitation suites.',
    ],
  },
];

// 4. Demo Users for all roles
export const mockDemoUsers: Record<UserRole, User> = {
  PATIENT: {
    id: 'user-patient-rahul',
    email: 'rahul.sharma@demo.com',
    role: 'PATIENT',
    firstName: 'Rahul',
    lastName: 'Sharma',
    phone: '+91 98230 45671',
    patientId: 'patient-rahul-01',
    hospitalPatientId: 'CHP-2026-0041',
  },
  DOCTOR: {
    id: 'user-doc-anita',
    email: 'dr.anita@cityhospitalpune.org',
    role: 'DOCTOR',
    firstName: 'Anita',
    lastName: 'Joshi',
    phone: '+91 98221 23456',
    doctorId: 'doc-cardio-1',
    doctorDepartment: 'Cardiology & Cardiac Sciences',
  },
  NURSE: {
    id: 'user-nurse-sneha',
    email: 'nurse.sneha@cityhospitalpune.org',
    role: 'NURSE',
    firstName: 'Sneha',
    lastName: 'Gaikwad',
    phone: '+91 98220 77889',
  },
  LAB_STAFF: {
    id: 'user-lab-amit',
    email: 'lab.technician@cityhospitalpune.org',
    role: 'LAB_STAFF',
    firstName: 'Amit',
    lastName: 'Shinde',
    phone: '+91 98220 99001',
  },
  RECEPTIONIST: {
    id: 'user-reception-pooja',
    email: 'reception@cityhospitalpune.org',
    role: 'RECEPTIONIST',
    firstName: 'Pooja',
    lastName: 'Kulkarni',
    phone: '+91 98220 44556',
  },
  ADMIN: {
    id: 'user-admin-vikram',
    email: 'admin@cityhospitalpune.org',
    role: 'ADMIN',
    firstName: 'Vikram',
    lastName: 'Sahasrabuddhe',
    phone: '+91 98220 11223',
  },
};

// 5. Patient Full Profile (for Rahul Sharma)
export const mockPatientProfile: any = {
  id: 'patient-rahul-01',
  userId: 'user-patient-rahul',
  patientId: 'CHP-2026-0041',
  dateOfBirth: '1988-06-14',
  gender: 'Male',
  bloodGroup: 'B+',
  emergencyContactName: 'Pooja Sharma (Spouse)',
  emergencyContactPhone: '+91 98230 99881',
  address: 'Flat 402, Shivajinagar Residency, Pune, Maharashtra 411005',
  abhaId: '91-8842-1049-3321',
  createdAt: '2026-01-15T09:00:00.000Z',
  updatedAt: '2026-03-20T10:00:00.000Z',
  user: {
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@demo.com',
    phone: '+91 98230 45671',
  },
  allergies: [
    {
      id: 'alg-1',
      patientId: 'patient-rahul-01',
      allergen: 'Amoxicillin / Penicillins',
      reaction: 'Urticarial skin rash and facial angioedema',
      severity: 'SEVERE',
      diagnosedDate: '2021-04-12',
    },
    {
      id: 'alg-2',
      patientId: 'patient-rahul-01',
      allergen: 'Aspirin / NSAIDs',
      reaction: 'Mild gastric irritation and bronchospasm',
      severity: 'MODERATE',
      diagnosedDate: '2023-01-20',
    },
  ],
  medications: [
    {
      id: 'med-1',
      patientId: 'patient-rahul-01',
      medicationName: 'Telmisartan Tablets IP',
      dosage: '40 mg',
      frequency: 'Once daily (morning after breakfast)',
      route: 'Oral',
      duration: 'Ongoing (Chronic management)',
      instructions: 'Monitor blood pressure weekly; do not stop abruptly.',
      prescribedBy: 'Dr. Anita Joshi (Cardiology)',
      status: 'ACTIVE',
      startDate: '2026-01-10T00:00:00.000Z',
    },
    {
      id: 'med-2',
      patientId: 'patient-rahul-01',
      medicationName: 'Atorvastatin Tablets IP',
      dosage: '10 mg',
      frequency: 'Once daily at bedtime',
      route: 'Oral',
      duration: 'Ongoing (Lipid management)',
      instructions: 'Take after dinner; report any unusual muscle soreness.',
      prescribedBy: 'Dr. Anita Joshi (Cardiology)',
      status: 'ACTIVE',
      startDate: '2026-01-10T00:00:00.000Z',
    },
  ],
  vitals: [
    {
      id: 'vit-1',
      patientId: 'patient-rahul-01',
      recordedById: 'user-nurse-sneha',
      recordedByRole: 'NURSE',
      systolicBp: 124,
      diastolicBp: 80,
      heartRate: 72,
      respiratoryRate: 15,
      oxygenSaturation: 99.0,
      temperatureF: 98.4,
      painScore: 0,
      notes: 'Stable outpatient checkup. BP normalized under Telmisartan therapy.',
      recordedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'vit-2',
      patientId: 'patient-rahul-01',
      recordedById: 'user-nurse-sneha',
      recordedByRole: 'NURSE',
      systolicBp: 130,
      diastolicBp: 84,
      heartRate: 76,
      respiratoryRate: 16,
      oxygenSaturation: 98.5,
      temperatureF: 98.6,
      painScore: 1,
      notes: 'Follow-up vitals recorded at triage.',
      recordedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    },
  ],
  consentRecords: [
    {
      id: 'cst-1',
      patientId: 'patient-rahul-01',
      consentType: 'DPDP_DATA_PROCESSING',
      granted: true,
      grantedAt: '2026-01-15T09:05:00.000Z',
      ipAddress: '192.168.1.104',
    },
    {
      id: 'cst-2',
      patientId: 'patient-rahul-01',
      consentType: 'AI_ASSESSMENT_CONSENT',
      granted: true,
      grantedAt: '2026-01-15T09:05:00.000Z',
      ipAddress: '192.168.1.104',
    },
  ],
  documents: [
    {
      id: 'doc-m-1',
      title: 'Complete Blood Count & Metabolic Panel',
      documentType: 'LAB_REPORT',
      patientId: 'patient-rahul-01',
      fileSize: '412 KB',
      verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      createdAt: '2026-02-14T11:00:00.000Z',
    },
    {
      id: 'doc-m-2',
      title: 'Cardiology OPD Clinical Summary Note',
      documentType: 'VISIT_SUMMARY',
      patientId: 'patient-rahul-01',
      fileSize: '298 KB',
      verificationHash: '98fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c442',
      createdAt: '2026-02-14T12:30:00.000Z',
    },
  ],
};

// 6. Lab Catalog
export const mockLabCatalog: LabCatalogItem[] = [
  {
    id: 'lab-cat-cbc',
    testCode: 'CBC-01',
    testName: 'Complete Blood Count (CBC) with Automated Differential',
    department: 'Hematology',
    sampleType: 'Whole Blood (EDTA)',
    turnAroundHours: 3,
    standardFee: 450.0,
    normalRangeMin: 12.0,
    normalRangeMax: 16.0,
    unit: 'g/dL',
    interpretation: 'Screening for anemia, leukocytosis, thrombocytopenia, and acute infection.',
  },
  {
    id: 'lab-cat-lipid',
    testCode: 'LIPID-02',
    testName: 'Fasting Lipid Profile (Total, HDL, LDL, Triglycerides)',
    department: 'Biochemistry',
    sampleType: 'Serum',
    turnAroundHours: 4,
    standardFee: 750.0,
    normalRangeMin: 0,
    normalRangeMax: 200,
    unit: 'mg/dL',
    interpretation: 'Cardiovascular atherosclerotic risk assessment.',
  },
  {
    id: 'lab-cat-hba1c',
    testCode: 'GLYC-03',
    testName: 'Glycated Hemoglobin (HbA1c) HPLC Assay',
    department: 'Biochemistry',
    sampleType: 'Whole Blood (EDTA)',
    turnAroundHours: 3,
    standardFee: 600.0,
    normalRangeMin: 4.0,
    normalRangeMax: 5.6,
    unit: '%',
    interpretation: '3-month average glycemic control for diabetic management.',
  },
  {
    id: 'lab-cat-trop',
    testCode: 'CARDIO-04',
    testName: 'High-Sensitivity Cardiac Troponin I (hs-cTnI)',
    department: 'Clinical Chemistry',
    sampleType: 'Heparinized Plasma',
    turnAroundHours: 1,
    standardFee: 1200.0,
    normalRangeMin: 0,
    normalRangeMax: 0.04,
    unit: 'ng/mL',
    interpretation: 'Critical biomarker for acute myocardial infarction.',
  },
  {
    id: 'lab-cat-kft',
    testCode: 'RENAL-05',
    testName: 'Renal Function Test (Creatinine, BUN, Electrolytes)',
    department: 'Biochemistry',
    sampleType: 'Serum',
    turnAroundHours: 3,
    standardFee: 650.0,
    normalRangeMin: 0.7,
    normalRangeMax: 1.3,
    unit: 'mg/dL',
    interpretation: 'Renal parenchymal and filtration status.',
  },
];

// 7. Lab Orders
export const mockLabOrders: LabOrder[] = [
  {
    id: 'order-101',
    orderNumber: 'LAB-2026-4401',
    patientId: 'patient-rahul-01',
    doctorId: 'doc-cardio-1',
    clinicalIndication: 'Routine quarterly cardiovascular monitoring and lipid evaluation.',
    status: 'VERIFIED',
    sampleCollectedAt: '2026-03-24T08:30:00.000Z',
    completedAt: '2026-03-24T12:00:00.000Z',
    verifiedAt: '2026-03-24T12:30:00.000Z',
    createdAt: '2026-03-24T08:00:00.000Z',
    patient: {
      patientId: 'CHP-2026-0041',
      gender: 'Male',
      user: {
        firstName: 'Rahul',
        lastName: 'Sharma',
        phone: '+91 98230 45671',
      },
    },
    doctor: {
      user: {
        firstName: 'Anita',
        lastName: 'Joshi',
      },
      department: {
        name: 'Cardiology & Cardiac Sciences',
      },
    },
    results: [
      {
        id: 'res-1',
        labOrderId: 'order-101',
        catalogTestId: 'lab-cat-lipid',
        testName: 'Total Serum Cholesterol',
        value: '178',
        unit: 'mg/dL',
        referenceRange: '< 200 mg/dL',
        flag: 'NORMAL',
        technicianNotes: 'Desirable lipid level maintained on Atorvastatin.',
        reportedAt: '2026-03-24T12:00:00.000Z',
      },
      {
        id: 'res-2',
        labOrderId: 'order-101',
        catalogTestId: 'lab-cat-lipid',
        testName: 'LDL Cholesterol (Calculated)',
        value: '98',
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        flag: 'NORMAL',
        technicianNotes: 'Target cardiovascular threshold met.',
        reportedAt: '2026-03-24T12:00:00.000Z',
      },
      {
        id: 'res-3',
        labOrderId: 'order-101',
        catalogTestId: 'lab-cat-cbc',
        testName: 'Hemoglobin (Hb)',
        value: '14.6',
        unit: 'g/dL',
        referenceRange: '13.0 - 17.0 g/dL',
        flag: 'NORMAL',
        technicianNotes: 'Normal normocytic red blood cell index.',
        reportedAt: '2026-03-24T12:00:00.000Z',
      },
    ],
  },
  {
    id: 'order-102',
    orderNumber: 'LAB-2026-4402',
    patientId: 'patient-rahul-01',
    doctorId: 'doc-gen-1',
    clinicalIndication: 'Pre-consultation metabolic checkup and HbA1c review.',
    status: 'SAMPLE_COLLECTED',
    sampleCollectedAt: '2026-03-25T09:15:00.000Z',
    createdAt: '2026-03-25T09:00:00.000Z',
    patient: {
      patientId: 'CHP-2026-0041',
      gender: 'Male',
      user: {
        firstName: 'Rahul',
        lastName: 'Sharma',
        phone: '+91 98230 45671',
      },
    },
    doctor: {
      user: {
        firstName: 'Rajesh',
        lastName: 'Kulkarni',
      },
      department: {
        name: 'General Medicine & Internal Care',
      },
    },
    results: [
      {
        id: 'res-4',
        labOrderId: 'order-102',
        catalogTestId: 'lab-cat-hba1c',
        testName: 'Glycated Hemoglobin (HbA1c)',
        value: '5.5',
        unit: '%',
        referenceRange: '< 5.7% (Non-Diabetic)',
        flag: 'NORMAL',
        technicianNotes: 'Assay running on HPLC automated analyzer.',
        reportedAt: '2026-03-25T09:30:00.000Z',
      },
    ],
  },
];

// Link lab orders to patient profile
mockPatientProfile.labOrders = mockLabOrders;

// 8. Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    patientId: 'patient-rahul-01',
    doctorId: 'doc-cardio-1',
    departmentId: 'dept-cardio',
    appointmentDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    timeSlot: '10:00 AM - 10:30 AM',
    status: 'SCHEDULED',
    type: 'ROUTINE',
    reason: 'Follow-up cardiology consultation and blood pressure evaluation.',
    notes: 'Patient will bring home blood pressure log.',
    createdAt: '2026-03-20T10:00:00.000Z',
    patient: {
      id: 'patient-rahul-01',
      patientId: 'CHP-2026-0041',
      gender: 'Male',
      dateOfBirth: '1988-06-14',
      bloodGroup: 'B+',
      user: {
        firstName: 'Rahul',
        lastName: 'Sharma',
        phone: '+91 98230 45671',
        email: 'rahul.sharma@demo.com',
      },
      allergies: mockPatientProfile.allergies,
      vitals: mockPatientProfile.vitals,
    },
    doctor: {
      id: 'doc-cardio-1',
      specialization: 'Senior Consultant Interventional Cardiologist',
      roomNumber: 'OPD-204',
      consultationFee: 1200.0,
      user: {
        firstName: 'Anita',
        lastName: 'Joshi',
      },
      department: {
        name: 'Cardiology & Cardiac Sciences',
      },
    },
    department: mockDepartments[1],
  },
  {
    id: 'appt-2',
    patientId: 'patient-rahul-01',
    doctorId: 'doc-gen-1',
    departmentId: 'dept-gen-med',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '11:30 AM - 12:00 PM',
    status: 'CHECKED_IN',
    type: 'ROUTINE',
    reason: 'Routine annual wellness examination and lifestyle advisory.',
    notes: 'Triage complete; awaiting room call.',
    createdAt: '2026-03-21T08:00:00.000Z',
    patient: {
      id: 'patient-rahul-01',
      patientId: 'CHP-2026-0041',
      gender: 'Male',
      dateOfBirth: '1988-06-14',
      bloodGroup: 'B+',
      user: {
        firstName: 'Rahul',
        lastName: 'Sharma',
        phone: '+91 98230 45671',
        email: 'rahul.sharma@demo.com',
      },
      allergies: mockPatientProfile.allergies,
      vitals: mockPatientProfile.vitals,
    },
    doctor: {
      id: 'doc-gen-1',
      specialization: 'Consultant Physician & Diabetologist',
      roomNumber: 'OPD-102',
      consultationFee: 900.0,
      user: {
        firstName: 'Rajesh',
        lastName: 'Kulkarni',
      },
      department: {
        name: 'General Medicine & Internal Care',
      },
    },
    department: mockDepartments[0],
    triageRecord: {
      id: 'trg-1',
      patientId: 'patient-rahul-01',
      appointmentId: 'appt-2',
      recordedById: 'user-nurse-sneha',
      triageCategory: 'GREEN',
      painScale: 0,
      mobilityStatus: 'Ambulatory',
      vitalsSnapshotJson: JSON.stringify({ bp: '124/80', hr: 72, spo2: 99, temp: 98.4 }),
      nurseNotes: 'Patient alert and oriented. Normal vital signs.',
      createdAt: new Date().toISOString(),
    },
  },
];

mockPatientProfile.appointments = mockAppointments;

// 9. Symptom Assessments
export const mockAssessments: SymptomAssessment[] = [
  {
    id: 'sa-01',
    patientId: 'patient-rahul-01',
    sessionNumber: 'SA-2026-9021',
    ageGroup: 'Adult (30-59)',
    chiefComplaint: 'Intermittent mild headache and cervical stiffness for 3 days',
    symptomsJson: JSON.stringify([
      { symptom: 'Headache', location: 'Occipital / Neck', duration: '3 days', severity: 'Mild' },
      { symptom: 'Neck stiffness', duration: '3 days', severity: 'Mild' },
    ]),
    followUpAnswersJson: JSON.stringify({ screenTime: 'High', stress: 'Moderate' }),
    safetyAlertTriggered: false,
    emergencyReason: undefined,
    aiUrgencyLevel: 'LOW',
    aiSummary:
      'Preliminary symptom pattern suggests tension-type or cervicogenic discomfort related to posture and screen usage. No neurological red flags identified.',
    aiPossibleExplanationsJson: JSON.stringify([
      {
        condition: 'Tension-Type Headache / Cervical Strain',
        relevance: 'Consistent with prolonged workstation postures and occipital muscle tightness.',
        source: 'NHS UK Health Guidelines',
      },
      {
        condition: 'Eye Strain / Ergonomic Fatigue',
        relevance: 'Common in software and desk professionals with high digital display exposure.',
        source: 'MoHFW India Health Resources',
      },
    ]),
    aiQuestionsForDoctorJson: JSON.stringify([
      'Does ergonomic physical therapy or neck stretching alleviate the tension?',
      'Is there an indication for an updated optometric refraction test?',
    ]),
    aiReferencesJson: JSON.stringify([
      {
        title: 'Management of Tension-Type Headaches',
        organization: 'World Health Organization',
        url: 'https://www.who.int/',
        lastReviewed: '2026-01-10',
      },
    ]),
    isAiGenerated: true,
    clinicianReviewStatus: 'ACCEPTED',
    clinicianNotes: 'Ergonomic adjustments advised. Prescribed mild neck mobilization exercises.',
    reviewedAt: '2026-03-22T14:30:00.000Z',
    createdAt: '2026-03-22T10:15:00.000Z',
    patient: {
      patientId: 'CHP-2026-0041',
      user: {
        firstName: 'Rahul',
        lastName: 'Sharma',
      },
    },
  },
];

mockPatientProfile.assessments = mockAssessments;

// 10. Triage Queue
export const mockTriageQueue = [
  {
    ...mockAppointments[1],
    triageCategory: 'GREEN',
    triageCategoryLabel: 'Standard Care',
    waitTime: '10 mins',
  },
  {
    id: 'appt-emergency-1',
    patientId: 'patient-meera-02',
    doctorId: 'doc-cardio-1',
    departmentId: 'dept-cardio',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '11:45 AM - 12:15 PM',
    status: 'CHECKED_IN',
    type: 'EMERGENCY_TRIAGE',
    reason: 'Severe palpitations and lightheadedness following morning exercise.',
    createdAt: new Date().toISOString(),
    patient: {
      id: 'patient-meera-02',
      patientId: 'CHP-2026-0082',
      gender: 'Female',
      dateOfBirth: '1976-11-23',
      bloodGroup: 'O+',
      user: {
        firstName: 'Meera',
        lastName: 'Patil',
        phone: '+91 98230 56782',
        email: 'meera.patil@demo.com',
      },
      allergies: [],
      vitals: [
        {
          id: 'vit-m-1',
          patientId: 'patient-meera-02',
          recordedById: 'user-nurse-sneha',
          recordedByRole: 'NURSE',
          systolicBp: 154,
          diastolicBp: 96,
          heartRate: 118,
          respiratoryRate: 20,
          oxygenSaturation: 97.0,
          temperatureF: 98.6,
          painScore: 3,
          notes: 'Tachycardia noted. Escalated for immediate ECG and physician evaluation.',
          recordedAt: new Date().toISOString(),
        },
      ],
    },
    doctor: {
      id: 'doc-cardio-1',
      specialization: 'Senior Consultant Interventional Cardiologist',
      roomNumber: 'OPD-204',
      consultationFee: 1200.0,
      user: {
        firstName: 'Anita',
        lastName: 'Joshi',
      },
      department: {
        name: 'Cardiology & Cardiac Sciences',
      },
    },
    department: mockDepartments[1],
    triageRecord: {
      id: 'trg-2',
      patientId: 'patient-meera-02',
      appointmentId: 'appt-emergency-1',
      recordedById: 'user-nurse-sneha',
      triageCategory: 'ORANGE',
      painScale: 3,
      mobilityStatus: 'Wheelchair',
      vitalsSnapshotJson: JSON.stringify({ bp: '154/96', hr: 118, spo2: 97, temp: 98.6 }),
      nurseNotes: 'Orange priority: sinus tachycardia vs SVT. ECG in progress.',
      createdAt: new Date().toISOString(),
    },
  },
];

// 11. Notifications
export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-patient-rahul',
    title: 'Diagnostic Lab Verified',
    message: 'Your Complete Blood Count (CBC) and Lipid results have been certified by Pathologist Amit Shinde.',
    type: 'LAB_RESULT',
    isRead: false,
    actionUrl: '/patient/labs',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-patient-rahul',
    title: 'Appointment Confirmed',
    message: 'Cardiology follow-up with Dr. Anita Joshi is confirmed for Room OPD-204.',
    type: 'APPOINTMENT',
    isRead: true,
    actionUrl: '/patient/appointments',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'user-patient-rahul',
    title: 'DPDP Act Compliance Verified',
    message: 'Your health record consent preferences have been recorded on immutable audit ledger.',
    type: 'SYSTEM',
    isRead: true,
    actionUrl: '/patient/profile',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

// 12. Admin Statistics & System Health
export const mockAdminStats = {
  totalPatients: 1420,
  totalDoctors: 6,
  appointmentsToday: 38,
  pendingLabOrders: 5,
  bedOccupancyPercent: 82,
  emergencyArrivalsToday: 7,
  departments: mockDepartments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    doctorsCount: 1,
    appointmentsToday: 6,
  })),
};

export const mockSystemHealth = {
  status: 'HEALTHY',
  uptime: '99.98%',
  activeNodes: 3,
  databaseLatencyMs: 1.4,
  aiInferenceLatencyMs: 124,
  auditLogIntegrity: 'VERIFIED_SHA256',
  abdmGatewayStatus: 'CONNECTED',
};

export const mockAuditLogs: AuditEvent[] = [
  {
    id: 'audit-01',
    userId: 'user-doc-anita',
    userEmail: 'dr.anita@cityhospitalpune.org',
    userRole: 'DOCTOR',
    action: 'VIEW',
    entityType: 'PATIENT',
    entityId: 'patient-rahul-01',
    details: 'Viewed patient electronic clinical records and historical vitals chart.',
    ipAddress: '192.168.1.52',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit-02',
    userId: 'user-lab-amit',
    userEmail: 'lab.technician@cityhospitalpune.org',
    userRole: 'LAB_STAFF',
    action: 'SIGN_OFF',
    entityType: 'LAB_ORDER',
    entityId: 'order-101',
    details: 'Digitally signed and certified Lipid Panel assay for order LAB-2026-4401.',
    ipAddress: '192.168.1.88',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'audit-03',
    userId: 'user-patient-rahul',
    userEmail: 'rahul.sharma@demo.com',
    userRole: 'PATIENT',
    action: 'AI_REVIEW',
    entityType: 'ASSESSMENT',
    entityId: 'sa-01',
    details: 'Initiated 10-step AI symptom assessment session SA-2026-9021 with explicit consent.',
    ipAddress: '192.168.1.104',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
];

// 13. Client-Side AI Symptom Evaluator (Offline capable)
export function evaluateSymptomsOffline(input: any) {
  const textCorpus = [
    input.chiefComplaint || '',
    ...(input.symptoms || []).map((s: any) => `${s.symptom || ''} ${s.location || ''} ${s.severity || ''}`),
    ...Object.values(input.followUpResponses || {}),
  ]
    .join(' ')
    .toLowerCase();

  const isEmergency =
    (textCorpus.includes('chest pain') || textCorpus.includes('chest pressure')) &&
    (textCorpus.includes('arm') || textCorpus.includes('jaw') || textCorpus.includes('sweat') || textCorpus.includes('breathless'));

  const isStroke =
    textCorpus.includes('slurred speech') ||
    textCorpus.includes('facial droop') ||
    (textCorpus.includes('one side') && textCorpus.includes('weakness'));

  if (isEmergency || isStroke) {
    return {
      safetyAlertTriggered: true,
      emergencyReason: isStroke
        ? 'Possible acute stroke warning signs detected (FAST criteria).'
        : 'Acute chest pain with radiation or autonomic symptoms (possible Acute Coronary Syndrome).',
      aiUrgencyLevel: 'EMERGENCY',
      aiSummary:
        'CRITICAL SAFETY WARNING: The reported symptoms match emergency medical criteria requiring immediate acute hospital resuscitation. Do not wait for routine OPD.',
      possibleExplanations: [
        {
          condition: isStroke ? 'Acute Cerebrovascular Event / Stroke' : 'Acute Coronary Syndrome / Myocardial Infarction',
          relevance: 'Immediate time-sensitive intervention required within the golden hour.',
          source: 'Emergency Medical Protocol (India 112)',
        },
      ],
      questionsForDoctor: ['Immediate assessment by emergency resuscitation team required.'],
      references: [
        {
          title: 'India Emergency Response Support System',
          organization: 'MoHFW & Home Affairs Govt of India',
          url: 'https://112.gov.in/',
          lastReviewed: '2026-01-01',
        },
      ],
      disclaimer: 'This is an automated safety alert. Call 112 immediately in India or go to nearest emergency room.',
      isAiGenerated: true,
    };
  }

  // Moderate / Routine
  const isCardio = textCorpus.includes('palpitation') || textCorpus.includes('bp') || textCorpus.includes('pressure');
  const isRespiratory = textCorpus.includes('cough') || textCorpus.includes('breath') || textCorpus.includes('cold') || textCorpus.includes('fever');

  let urgency: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
  if (textCorpus.includes('severe') || textCorpus.includes('high fever')) urgency = 'HIGH';
  else if (textCorpus.includes('mild') || textCorpus.includes('slight')) urgency = 'LOW';

  return {
    safetyAlertTriggered: false,
    emergencyReason: null,
    aiUrgencyLevel: urgency,
    aiSummary: `Clinical symptom assessment for ${input.chiefComplaint || 'reported symptoms'}. No immediate emergency red flags were detected during baseline screening. Structured clinical consultation is advised.`,
    possibleExplanations: [
      {
        condition: isCardio
          ? 'Cardiovascular or Blood Pressure Fluctuation'
          : isRespiratory
          ? 'Upper Respiratory Tract Infection / Seasonal Rhinitis'
          : 'Musculoskeletal Strain or Tension Discomfort',
        relevance: 'Correlates with reported onset, duration, and patient profile.',
        source: 'MoHFW India & WHO Clinical Care Guidelines',
      },
      {
        condition: 'Lifestyle, Hydration, or Stress-Induced Symptoms',
        relevance: 'Common contributing factor in acute transient complaints.',
        source: 'NHS UK Health Guidance',
      },
    ],
    questionsForDoctor: [
      'What specific diagnostic laboratory or imaging tests are recommended?',
      'Are there preventive dietary or physical therapy modifications indicated?',
      'What are the red-flag symptoms that should prompt an immediate emergency room visit?',
    ],
    references: [
      {
        title: 'Evidence-Based Adult Primary Care Protocols',
        organization: 'World Health Organization (WHO)',
        url: 'https://www.who.int/',
        lastReviewed: '2026-02-15',
      },
      {
        title: 'National Health Guidelines India',
        organization: 'MoHFW Govt. of India',
        url: 'https://mohfw.gov.in/',
        lastReviewed: '2026-01-20',
      },
    ],
    disclaimer:
      'AI-assisted preliminary triage decision support only. Final diagnosis, prescription, and treatment plans are governed strictly by licensed attending physicians.',
    isAiGenerated: true,
  };
}
