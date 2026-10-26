import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding City Hospital Pune Database ---');

  // Clean existing records if any
  await prisma.auditEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.medicalDocument.deleteMany();
  await prisma.labResult.deleteMany();
  await prisma.labOrder.deleteMany();
  await prisma.labCatalog.deleteMany();
  await prisma.triageRecord.deleteMany();
  await prisma.symptomAssessment.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.allergy.deleteMany();
  await prisma.vitalSign.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Departments
  const generalMedicine = await prisma.department.create({
    data: {
      name: 'General Medicine & Internal Care',
      code: 'GEN-MED',
      description: 'Comprehensive adult primary care, acute disease diagnosis, and chronic disease management.',
      icon: 'Stethoscope',
      floor: 'Floor 1, Wing A',
    },
  });

  const cardiology = await prisma.department.create({
    data: {
      name: 'Cardiology & Cardiac Sciences',
      code: 'CARDIO',
      description: 'Advanced cardiovascular care, echocardiography, cardiac intervention, and preventive cardiology.',
      icon: 'Heart',
      floor: 'Floor 2, Wing B',
    },
  });

  const neurology = await prisma.department.create({
    data: {
      name: 'Neurology & Neuro-Sciences',
      code: 'NEURO',
      description: 'Diagnosis and management of neurological disorders, stroke care, epilepsy, and peripheral neuropathy.',
      icon: 'Brain',
      floor: 'Floor 3, Wing A',
    },
  });

  const orthopedics = await prisma.department.create({
    data: {
      name: 'Orthopedics & Joint Replacement',
      code: 'ORTHO',
      description: 'Comprehensive bone, joint, musculoskeletal trauma, arthroscopy, and spine care.',
      icon: 'Bone',
      floor: 'Floor 2, Wing C',
    },
  });

  const pediatrics = await prisma.department.create({
    data: {
      name: 'Pediatrics & Neonatal Care',
      code: 'PEDIATRICS',
      description: 'Specialized healthcare for infants, children, and adolescents with developmental surveillance.',
      icon: 'Baby',
      floor: 'Floor 1, Wing C',
    },
  });

  const pulmonology = await prisma.department.create({
    data: {
      name: 'Pulmonology & Respiratory Medicine',
      code: 'PULMO',
      description: 'Asthma, COPD, lung infections, post-COVID respiratory monitoring, and allergy management.',
      icon: 'Lungs',
      floor: 'Floor 3, Wing B',
    },
  });

  // 2. Staff & User Accounts
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      firstName: 'Vikram',
      lastName: 'Sahasrabuddhe',
      phone: '+91 98220 11223',
    },
  });

  // Receptionist
  const receptionistUser = await prisma.user.create({
    data: {
      email: 'reception@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'RECEPTIONIST',
      firstName: 'Pooja',
      lastName: 'Kulkarni',
      phone: '+91 98220 44556',
    },
  });

  // Nurse
  const nurseUser = await prisma.user.create({
    data: {
      email: 'nurse.sneha@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'NURSE',
      firstName: 'Sneha',
      lastName: 'Gaikwad',
      phone: '+91 98220 77889',
    },
  });

  // Lab Technician
  const labUser = await prisma.user.create({
    data: {
      email: 'lab.technician@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'LAB_STAFF',
      firstName: 'Amit',
      lastName: 'Shinde',
      phone: '+91 98220 99001',
    },
  });

  // Doctor 1: Dr. Anita Joshi (Cardiology)
  const drAnitaUser = await prisma.user.create({
    data: {
      email: 'dr.anita@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'DOCTOR',
      firstName: 'Anita',
      lastName: 'Joshi',
      phone: '+91 98221 23456',
    },
  });
  const drAnita = await prisma.doctor.create({
    data: {
      userId: drAnitaUser.id,
      licenseNumber: 'MCI-MH-45892',
      departmentId: cardiology.id,
      specialization: 'Senior Consultant Interventional Cardiologist',
      qualifications: 'MBBS, MD (Medicine), DM (Cardiology), FESC',
      experienceYears: 16,
      consultationFee: 1200.0,
      roomNumber: 'OPD-204',
      bio: 'Specialist in ischemic heart disease, cardiac rhythm management, coronary angiography, and hypertension clinic.',
      availability: JSON.stringify(['Mon 09:30-13:30', 'Tue 09:30-13:30', 'Thu 14:00-18:00', 'Fri 09:30-13:30']),
    },
  });

  // Doctor 2: Dr. Rajesh Kulkarni (General Medicine)
  const drRajeshUser = await prisma.user.create({
    data: {
      email: 'dr.rajesh@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'DOCTOR',
      firstName: 'Rajesh',
      lastName: 'Kulkarni',
      phone: '+91 98221 34567',
    },
  });
  const drRajesh = await prisma.doctor.create({
    data: {
      userId: drRajeshUser.id,
      licenseNumber: 'MCI-MH-38910',
      departmentId: generalMedicine.id,
      specialization: 'Consultant Physician & Diabetologist',
      qualifications: 'MBBS, MD (Internal Medicine), PG Diab (Boston)',
      experienceYears: 18,
      consultationFee: 900.0,
      roomNumber: 'OPD-102',
      bio: 'Extensive expertise in metabolic syndrome, lifestyle disorders, infectious diseases, and holistic adult medicine.',
      availability: JSON.stringify(['Mon 09:00-14:00', 'Wed 09:00-14:00', 'Thu 09:00-14:00', 'Sat 10:00-15:00']),
    },
  });

  // Doctor 3: Dr. Vikram Deshmukh (Neurology)
  const drVikramUser = await prisma.user.create({
    data: {
      email: 'dr.vikram@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'DOCTOR',
      firstName: 'Vikram',
      lastName: 'Deshmukh',
      phone: '+91 98221 45678',
    },
  });
  const drVikram = await prisma.doctor.create({
    data: {
      userId: drVikramUser.id,
      licenseNumber: 'MCI-MH-51204',
      departmentId: neurology.id,
      specialization: 'Consultant Neurologist & Stroke Specialist',
      qualifications: 'MBBS, MD (Med), DM (Neurology), FINR',
      experienceYears: 12,
      consultationFee: 1400.0,
      roomNumber: 'OPD-305',
      bio: 'Specialist in migraine syndromes, acute neuro-vascular emergencies, neuromuscular disorders, and electrophysiology.',
      availability: JSON.stringify(['Tue 10:00-14:00', 'Wed 14:00-18:00', 'Fri 10:00-14:00']),
    },
  });

  // Doctor 4: Dr. Sunita Patwardhan (Orthopedics)
  const drSunitaUser = await prisma.user.create({
    data: {
      email: 'dr.sunita@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'DOCTOR',
      firstName: 'Sunita',
      lastName: 'Patwardhan',
      phone: '+91 98221 56789',
    },
  });
  const drSunita = await prisma.doctor.create({
    data: {
      userId: drSunitaUser.id,
      licenseNumber: 'MCI-MH-42991',
      departmentId: orthopedics.id,
      specialization: 'Orthopedic & Joint Replacement Surgeon',
      qualifications: 'MBBS, MS (Ortho), Fellowship in Arthroplasty (UK)',
      experienceYears: 15,
      consultationFee: 1100.0,
      roomNumber: 'OPD-210',
      bio: 'Expertise in knee and hip arthroplasty, sports ligament reconstructions, and osteoporosis care.',
      availability: JSON.stringify(['Mon 10:00-15:00', 'Wed 10:00-15:00', 'Fri 14:00-18:00']),
    },
  });

  // Doctor 5: Dr. Rohan Mehta (Pediatrics)
  const drRohanUser = await prisma.user.create({
    data: {
      email: 'dr.rohan@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'DOCTOR',
      firstName: 'Rohan',
      lastName: 'Mehta',
      phone: '+91 98221 67890',
    },
  });
  const drRohan = await prisma.doctor.create({
    data: {
      userId: drRohanUser.id,
      licenseNumber: 'MCI-MH-60312',
      departmentId: pediatrics.id,
      specialization: 'Consultant Pediatrician & Neonatologist',
      qualifications: 'MBBS, DNB (Pediatrics), Fellowship in Neonatal Intensive Care',
      experienceYears: 10,
      consultationFee: 850.0,
      roomNumber: 'OPD-114',
      bio: 'Passionate about pediatric preventive health, immunization, growth tracking, and childhood infections.',
      availability: JSON.stringify(['Mon 09:00-13:00', 'Tue 09:00-13:00', 'Thu 09:00-13:00', 'Sat 09:00-13:00']),
    },
  });

  // Doctor 6: Dr. Priya Shinde (Pulmonology)
  const drPriyaUser = await prisma.user.create({
    data: {
      email: 'dr.priya@cityhospitalpune.org',
      passwordHash: defaultPasswordHash,
      role: 'DOCTOR',
      firstName: 'Priya',
      lastName: 'Shinde',
      phone: '+91 98221 78901',
    },
  });
  const drPriya = await prisma.doctor.create({
    data: {
      userId: drPriyaUser.id,
      licenseNumber: 'MCI-MH-47812',
      departmentId: pulmonology.id,
      specialization: 'Consultant Pulmonologist & Sleep Specialist',
      qualifications: 'MBBS, MD (Pulmonary Medicine), FAPSR',
      experienceYears: 13,
      consultationFee: 1000.0,
      roomNumber: 'OPD-312',
      bio: 'Expert in adult asthma, interstitial lung diseases, obstructive sleep apnea, and bronchoscopy.',
      availability: JSON.stringify(['Tue 11:00-16:00', 'Thu 11:00-16:00', 'Sat 10:00-14:00']),
    },
  });

  // 3. Patients (Fictional Demo Records with clear disclaimers)
  // Patient 1: Rahul Sharma (Primary Demo Patient)
  const patient1User = await prisma.user.create({
    data: {
      email: 'rahul.sharma@demo.com',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+91 98230 45671',
    },
  });
  const patient1 = await prisma.patient.create({
    data: {
      userId: patient1User.id,
      patientId: 'CHP-2026-0041',
      dateOfBirth: '1988-06-14',
      gender: 'Male',
      bloodGroup: 'B+',
      emergencyContactName: 'Pooja Sharma (Spouse)',
      emergencyContactPhone: '+91 98230 99881',
      address: 'Flat 402, Shivajinagar Residency, Pune, Maharashtra 411005',
      abhaId: '91-8842-1049-3321',
    },
  });

  // Patient 2: Meera Patil
  const patient2User = await prisma.user.create({
    data: {
      email: 'meera.patil@demo.com',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      firstName: 'Meera',
      lastName: 'Patil',
      phone: '+91 98230 56782',
    },
  });
  const patient2 = await prisma.patient.create({
    data: {
      userId: patient2User.id,
      patientId: 'CHP-2026-0082',
      dateOfBirth: '1976-11-23',
      gender: 'Female',
      bloodGroup: 'O+',
      emergencyContactName: 'Sanjay Patil (Brother)',
      emergencyContactPhone: '+91 98230 88772',
      address: 'Plot 15, Kothrud Hills, Pune, Maharashtra 411038',
      abhaId: '91-7643-9821-4412',
    },
  });

  // Patient 3: Arun Joshi
  const patient3User = await prisma.user.create({
    data: {
      email: 'arun.joshi@demo.com',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      firstName: 'Arun',
      lastName: 'Joshi',
      phone: '+91 98230 67893',
    },
  });
  const patient3 = await prisma.patient.create({
    data: {
      userId: patient3User.id,
      patientId: 'CHP-2026-0115',
      dateOfBirth: '1962-03-08',
      gender: 'Male',
      bloodGroup: 'A+',
      emergencyContactName: 'Sunil Joshi (Son)',
      emergencyContactPhone: '+91 98230 77663',
      address: 'Rowhouse 3, Aundh Enclave, Pune, Maharashtra 411007',
      abhaId: '91-6211-5534-1903',
    },
  });

  // 4. Clinical Details for Patient 1 (Rahul Sharma)
  // Allergies
  await prisma.allergy.createMany({
    data: [
      {
        patientId: patient1.id,
        allergen: 'Amoxicillin / Penicillins',
        reaction: 'Urticarial skin rash and facial angioedema',
        severity: 'SEVERE',
        diagnosedDate: '2021-04-12',
      },
      {
        patientId: patient1.id,
        allergen: 'Aspirin / NSAIDs',
        reaction: 'Mild gastric irritation and bronchospasm',
        severity: 'MODERATE',
        diagnosedDate: '2023-01-20',
      },
    ],
  });

  // Active Medications
  await prisma.medication.createMany({
    data: [
      {
        patientId: patient1.id,
        medicationName: 'Telmisartan Tablets IP',
        dosage: '40 mg',
        frequency: 'Once daily (morning after breakfast)',
        route: 'Oral',
        duration: 'Ongoing (Chronic management)',
        instructions: 'Monitor blood pressure weekly; do not stop abruptly.',
        prescribedBy: 'Dr. Anita Joshi (Cardiology)',
        status: 'ACTIVE',
      },
      {
        patientId: patient1.id,
        medicationName: 'Atorvastatin Tablets IP',
        dosage: '10 mg',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        duration: 'Ongoing (Lipid management)',
        instructions: 'Take after dinner; report any unusual muscle soreness.',
        prescribedBy: 'Dr. Anita Joshi (Cardiology)',
        status: 'ACTIVE',
      },
    ],
  });

  // Vital Signs Timeline for Patient 1
  await prisma.vitalSign.createMany({
    data: [
      {
        patientId: patient1.id,
        recordedById: nurseUser.id,
        recordedByRole: 'NURSE',
        systolicBp: 132,
        diastolicBp: 86,
        heartRate: 74,
        respiratoryRate: 16,
        oxygenSaturation: 98.5,
        temperatureF: 98.4,
        painScore: 1,
        notes: 'Routine outpatient check-in. Patient reports feeling stable on Telmisartan.',
        recordedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
      },
      {
        patientId: patient1.id,
        recordedById: nurseUser.id,
        recordedByRole: 'NURSE',
        systolicBp: 128,
        diastolicBp: 82,
        heartRate: 72,
        respiratoryRate: 15,
        oxygenSaturation: 99.0,
        temperatureF: 98.6,
        painScore: 0,
        notes: 'Pre-consultation vitals for cardiology follow-up. Blood pressure within target range.',
        recordedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      },
      {
        patientId: patient1.id,
        recordedById: nurseUser.id,
        recordedByRole: 'NURSE',
        systolicBp: 130,
        diastolicBp: 84,
        heartRate: 76,
        respiratoryRate: 16,
        oxygenSaturation: 98.8,
        temperatureF: 98.5,
        painScore: 1,
        notes: 'Triage assessment for mild exertional tightness evaluation.',
        recordedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      },
    ],
  });

  // Consent Records (DPDP Act 2023 India Compliance)
  await prisma.consentRecord.createMany({
    data: [
      {
        patientId: patient1.id,
        consentType: 'DPDP_DATA_PROCESSING',
        granted: true,
        grantedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
        ipAddress: '103.21.144.12',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      },
      {
        patientId: patient1.id,
        consentType: 'AI_ASSESSMENT_CONSENT',
        granted: true,
        grantedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        ipAddress: '103.21.144.12',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      },
      {
        patientId: patient1.id,
        consentType: 'LAB_PROCESSING',
        granted: true,
        grantedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        ipAddress: '103.21.144.12',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      },
    ],
  });

  // 5. Laboratory Catalog
  const cbc = await prisma.labCatalog.create({
    data: {
      testCode: 'CBC-01',
      testName: 'Complete Blood Count (CBC) with Automated Differential',
      department: 'Hematology',
      sampleType: 'Whole Blood (EDTA)',
      turnAroundHours: 4,
      standardFee: 450.0,
      normalRangeMin: 13.0,
      normalRangeMax: 17.0,
      unit: 'g/dL (Hemoglobin)',
      interpretation: 'Screens for anemia, infections, hematological malignancies, and clotting abnormalities.',
    },
  });

  const lipid = await prisma.labCatalog.create({
    data: {
      testCode: 'LIPID-02',
      testName: 'Comprehensive Lipid Profile (Fasting 12 hrs)',
      department: 'Biochemistry',
      sampleType: 'Serum (Plain Gel Tube)',
      turnAroundHours: 6,
      standardFee: 850.0,
      normalRangeMin: 125.0,
      normalRangeMax: 200.0,
      unit: 'mg/dL (Total Cholesterol)',
      interpretation: 'Evaluates cardiovascular risk profile including Total Cholesterol, HDL, LDL, VLDL, and Triglycerides.',
    },
  });

  const hba1c = await prisma.labCatalog.create({
    data: {
      testCode: 'HBA1C-03',
      testName: 'Glycated Hemoglobin (HbA1c) HPLC Gold Standard',
      department: 'Biochemistry',
      sampleType: 'Whole Blood (EDTA)',
      turnAroundHours: 4,
      standardFee: 600.0,
      normalRangeMin: 4.0,
      normalRangeMax: 5.6,
      unit: '% HbA1c',
      interpretation: 'Provides average glycemic control over the preceding 2 to 3 months (ADA/WHO criteria).',
    },
  });

  const rft = await prisma.labCatalog.create({
    data: {
      testCode: 'RFT-04',
      testName: 'Renal Function Test (BUN, Serum Creatinine, eGFR)',
      department: 'Biochemistry',
      sampleType: 'Serum',
      turnAroundHours: 5,
      standardFee: 750.0,
      normalRangeMin: 0.7,
      normalRangeMax: 1.2,
      unit: 'mg/dL (Creatinine)',
      interpretation: 'Evaluates glomerular filtration, renal clearance, and electrolyte balance.',
    },
  });

  const tropI = await prisma.labCatalog.create({
    data: {
      testCode: 'TROP-05',
      testName: 'High-Sensitivity Cardiac Troponin-I (hs-cTnI)',
      department: 'Biochemistry / Emergency Lab',
      sampleType: 'Plasma (Heparin)',
      turnAroundHours: 1,
      standardFee: 1400.0,
      normalRangeMin: 0.0,
      normalRangeMax: 0.04,
      unit: 'ng/mL',
      interpretation: 'Biomarker for myocardial cellular injury. Highly sensitive indicator for acute coronary syndromes.',
    },
  });

  // 6. Appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const lastWeekStr = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

  // Past completed appointment for Rahul Sharma with Dr. Anita Joshi
  const appt1 = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: drAnita.id,
      departmentId: cardiology.id,
      appointmentDate: lastWeekStr,
      timeSlot: '10:30 AM - 11:00 AM',
      status: 'COMPLETED',
      type: 'ROUTINE',
      reason: 'Routine quarterly cardiovascular review and medication refill evaluation.',
      notes: 'Patient advised to bring recent lipid profile and home blood pressure log.',
    },
  });

  // Encounter for past appointment
  const encounter1 = await prisma.encounter.create({
    data: {
      appointmentId: appt1.id,
      patientId: patient1.id,
      doctorId: drAnita.id,
      chiefComplaint: 'Quarterly cardiovascular review; reports good exercise tolerance with brisk walking 30 mins/day.',
      historyOfPresentIllness: '36-year-old male with diagnosed essential hypertension for 2 years, managed on Telmisartan 40mg OD. Denies chest pain, orthopnea, or pedal edema.',
      examinationNotes: 'General condition good. S1 S2 heard normal, no murmurs. Chest clear bilaterally. BP: 128/82 mmHg, HR: 72 bpm regular.',
      diagnosis: 'Essential (primary) hypertension, well controlled; Mild dyslipidemia on lifestyle and statin therapy.',
      icdCode: 'I10, E78.5',
      treatmentPlan: '1. Continue Tab Telmisartan 40 mg OD morning.\n2. Continue Tab Atorvastatin 10 mg OD bedtime.\n3. Low sodium DASH diet.\n4. Repeat Fasting Lipid Profile in 3 months.',
      followUpDate: '2026-11-20',
      status: 'SIGNED',
      signedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
    },
  });

  // Lab Order from that encounter
  const labOrder1 = await prisma.labOrder.create({
    data: {
      orderNumber: 'LAB-2026-0812',
      patientId: patient1.id,
      doctorId: drAnita.id,
      encounterId: encounter1.id,
      clinicalIndication: 'Routine surveillance for dyslipidemia on statin therapy.',
      status: 'VERIFIED',
      sampleCollectedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 3600 * 1000),
      completedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 4 * 3600 * 1000),
      verifiedById: labUser.id,
      verifiedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 5 * 3600 * 1000),
    },
  });

  // Lab Results for labOrder1
  await prisma.labResult.createMany({
    data: [
      {
        labOrderId: labOrder1.id,
        catalogTestId: lipid.id,
        testName: 'Total Serum Cholesterol',
        value: '178.5',
        unit: 'mg/dL',
        referenceRange: '125.0 - 200.0',
        flag: 'NORMAL',
        technicianNotes: 'Desirable target achieved on current statin regimen.',
      },
      {
        labOrderId: labOrder1.id,
        catalogTestId: lipid.id,
        testName: 'Low-Density Lipoprotein (LDL) Calculated',
        value: '104.2',
        unit: 'mg/dL',
        referenceRange: '< 100.0 (High Risk) / < 130.0 (Moderate Risk)',
        flag: 'NORMAL',
        technicianNotes: 'Within acceptable clinical range for moderate cardiovascular risk.',
      },
      {
        labOrderId: labOrder1.id,
        catalogTestId: lipid.id,
        testName: 'High-Density Lipoprotein (HDL) Direct',
        value: '44.8',
        unit: 'mg/dL',
        referenceRange: '> 40.0',
        flag: 'NORMAL',
        technicianNotes: 'Protective lipid component adequate.',
      },
      {
        labOrderId: labOrder1.id,
        catalogTestId: lipid.id,
        testName: 'Serum Triglycerides (Fasting)',
        value: '145.0',
        unit: 'mg/dL',
        referenceRange: '< 150.0',
        flag: 'NORMAL',
        technicianNotes: 'Optimal baseline fasting level.',
      },
    ],
  });

  // Medical Document record for Lab Report
  await prisma.medicalDocument.create({
    data: {
      title: 'Fasting Lipid Profile Report - LAB-2026-0812',
      documentType: 'LAB_REPORT',
      patientId: patient1.id,
      labOrderId: labOrder1.id,
      fileSize: '148 KB',
      verificationHash: 'SHA256:d8a21f6645b209e5b721869e51c8e1',
    },
  });

  // Today's Upcoming / Checked-in Appointment for Rahul Sharma with Dr. Anita Joshi
  const apptToday = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: drAnita.id,
      departmentId: cardiology.id,
      appointmentDate: todayStr,
      timeSlot: '11:30 AM - 12:00 PM',
      status: 'CHECKED_IN',
      type: 'FOLLOW_UP',
      reason: 'Mild intermittent retrosternal discomfort after heavy meals, reviewed via AI symptom assistant.',
      notes: 'Patient completed AI symptom assessment SA-2026-0041 prior to check-in.',
    },
  });

  // Triage Record for today's appointment
  await prisma.triageRecord.create({
    data: {
      patientId: patient1.id,
      appointmentId: apptToday.id,
      recordedById: nurseUser.id,
      triageCategory: 'YELLOW', // Urgent
      painScale: 2,
      mobilityStatus: 'Ambulatory',
      vitalsSnapshotJson: JSON.stringify({
        bp: '130/84 mmHg',
        hr: 76,
        spo2: '98.8%',
        temp: '98.5 F',
        rr: 16,
      }),
      nurseNotes: 'Patient alert and oriented. Ambulatory. Reports mild epigastric/retrosternal heaviness after spicy lunch yesterday. Denies radiation to left arm or jaw. No diaphoresis.',
      escalatedToDoctorId: drAnita.id,
    },
  });

  // Tomorrow's Appointment for Meera Patil with Dr. Rajesh Kulkarni
  await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: drRajesh.id,
      departmentId: generalMedicine.id,
      appointmentDate: tomorrowStr,
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'SCHEDULED',
      type: 'ROUTINE',
      reason: 'Chronic fatigue and recurrent headache evaluation.',
    },
  });

  // Tomorrow's Appointment for Arun Joshi with Dr. Sunita Patwardhan
  await prisma.appointment.create({
    data: {
      patientId: patient3.id,
      doctorId: drSunita.id,
      departmentId: orthopedics.id,
      appointmentDate: tomorrowStr,
      timeSlot: '11:00 AM - 11:30 AM',
      status: 'SCHEDULED',
      type: 'ROUTINE',
      reason: 'Bilateral knee joint pain, worse on descending stairs.',
    },
  });

  // 7. Seed AI Symptom Assessment Session for Patient 1
  await prisma.symptomAssessment.create({
    data: {
      patientId: patient1.id,
      sessionNumber: 'SA-2026-0041',
      ageGroup: 'Adult (30-49)',
      chiefComplaint: 'Mild chest tightness and acid sensation after heavy meals for the past 3 days.',
      symptomsJson: JSON.stringify([
        { symptom: 'Retrosternal chest tightness / fullness', duration: '3 days', severity: 'Mild (3/10)', location: 'Mid-chest / epigastrium' },
        { symptom: 'Acid regurgitation / Sour taste in mouth', duration: '3 days', severity: 'Mild', location: 'Throat' },
        { symptom: 'Bloating after food', duration: '1 week', severity: 'Mild', location: 'Upper abdomen' },
      ]),
      followUpAnswersJson: JSON.stringify({
        exertionWorsening: 'No, does not increase when climbing stairs or walking briskly.',
        sweatingOrBreathlessness: 'None.',
        radiationToArmOrJaw: 'None.',
        relievedByAntacid: 'Partially relieved with over-the-counter antacid suspension.',
      }),
      safetyAlertTriggered: false,
      emergencyReason: null,
      aiUrgencyLevel: 'MODERATE',
      aiSummary: 'Preliminary AI decision-support suggests mild upper gastrointestinal symptoms consistent with gastroesophageal reflux (GERD) or functional dyspepsia. However, given patient history of managed hypertension, an in-person clinical evaluation with 12-lead ECG is advised to definitively exclude atypical angina.',
      aiPossibleExplanationsJson: JSON.stringify([
        {
          condition: 'Gastroesophageal Reflux Disease (GERD) / Dyspepsia',
          relevance: 'High alignment with meal-related timing, sour regurgitation, and lack of exertional exacerbation.',
          source: 'NHS / WHO Primary Care Guidelines',
        },
        {
          condition: 'Atypical Angina Pectoris (Requires Clinician Exclusion)',
          relevance: 'Must be clinically differentiated by an attending physician in patients with cardiovascular risk factors.',
          source: 'AHA / ACC / Indian Heart Association Guidance',
        },
      ]),
      aiQuestionsForDoctorJson: JSON.stringify([
        'Could my symptoms be triggered by acid reflux rather than cardiac issues?',
        'Would a baseline 12-lead ECG or treadmill test be recommended today?',
        'Are there dietary modifications or temporary acid suppressant medications suitable for me?',
      ]),
      aiReferencesJson: JSON.stringify([
        {
          title: 'Heartburn and Gastroesophageal Reflux',
          organization: 'National Health Service (NHS UK)',
          url: 'https://www.nhs.uk/conditions/heartburn-and-acid-reflux/',
          lastReviewed: '2024-05',
        },
        {
          title: 'Hypertension Clinical Practice Guidelines',
          organization: 'Ministry of Health and Family Welfare, Govt. of India',
          url: 'https://mohfw.gov.in/',
          lastReviewed: '2023-11',
        },
      ]),
      isAiGenerated: true,
      clinicianReviewStatus: 'PENDING',
      clinicianNotes: null,
    },
  });

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: patient1User.id,
        title: 'Appointment Confirmed Today',
        message: 'Your cardiology consultation with Dr. Anita Joshi is scheduled for today at 11:30 AM in OPD-204.',
        type: 'APPOINTMENT',
        isRead: false,
        actionUrl: '/patient/appointments',
      },
      {
        userId: patient1User.id,
        title: 'AI Assessment Saved to Record',
        message: 'Your preliminary symptom summary (SA-2026-0041) has been attached to your clinical file for doctor review.',
        type: 'SYSTEM',
        isRead: true,
        actionUrl: '/patient/assessments',
      },
      {
        userId: drAnitaUser.id,
        title: 'Patient Checked In: Rahul Sharma',
        message: 'Rahul Sharma (CHP-2026-0041) is checked in and triaged. Chief complaint: Retrosternal tightness post meals.',
        type: 'TRIAGE_ALERT',
        isRead: false,
        actionUrl: '/doctor/queue',
      },
    ],
  });

  // 9. Initial Audit Log Records
  await prisma.auditEvent.createMany({
    data: [
      {
        userId: adminUser.id,
        userEmail: adminUser.email,
        userRole: 'ADMIN',
        action: 'CREATE',
        entityType: 'SYSTEM',
        details: 'Initial system deployment and departmental configuration established.',
        ipAddress: '127.0.0.1',
      },
      {
        userId: drAnitaUser.id,
        userEmail: drAnitaUser.email,
        userRole: 'DOCTOR',
        action: 'SIGN_OFF',
        entityType: 'ENCOUNTER',
        entityId: encounter1.id,
        details: 'Signed clinical encounter note and ordered Fasting Lipid Profile.',
        ipAddress: '192.168.1.45',
      },
      {
        userId: labUser.id,
        userEmail: labUser.email,
        userRole: 'LAB_STAFF',
        action: 'CREATE',
        entityType: 'LAB_ORDER',
        entityId: labOrder1.id,
        details: 'Verified and approved diagnostic lipid panel results.',
        ipAddress: '192.168.1.88',
      },
      {
        userId: nurseUser.id,
        userEmail: nurseUser.email,
        userRole: 'NURSE',
        action: 'CREATE',
        entityType: 'APPOINTMENT',
        entityId: apptToday.id,
        details: 'Triage assessment completed: ESI Category Yellow (Urgent). Vitals recorded.',
        ipAddress: '192.168.1.33',
      },
    ],
  });

  console.log('--- Database Seeded Successfully with Realistic Healthcare Records ---');
  console.log('Demo Accounts:');
  console.log('  Admin:        admin@cityhospitalpune.org       / password123');
  console.log('  Doctor:       dr.anita@cityhospitalpune.org    / password123');
  console.log('  Doctor:       dr.rajesh@cityhospitalpune.org   / password123');
  console.log('  Nurse:        nurse.sneha@cityhospitalpune.org / password123');
  console.log('  Lab Staff:    lab.technician@cityhospitalpune.org / password123');
  console.log('  Receptionist: reception@cityhospitalpune.org   / password123');
  console.log('  Patient:      rahul.sharma@demo.com            / password123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
