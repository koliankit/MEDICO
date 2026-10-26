export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'LAB_STAFF' | 'RECEPTIONIST' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  patientId?: string;
  hospitalPatientId?: string;
  doctorId?: string;
  doctorDepartment?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  floor: string;
  doctors?: Doctor[];
  doctorCount?: number;
  appointmentCount?: number;
}

export interface Doctor {
  id: string;
  userId: string;
  licenseNumber: string;
  departmentId: string;
  department?: Department;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: number;
  roomNumber: string;
  bio: string;
  isAvailable: boolean;
  availability?: string;
  user: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface VitalSign {
  id: string;
  patientId: string;
  recordedById: string;
  recordedByRole: string;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  temperatureF: number;
  painScore: number;
  notes?: string;
  recordedAt: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  diagnosedDate?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  encounterId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions?: string;
  prescribedBy: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
  startDate: string;
  endDate?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  appointmentDate: string;
  timeSlot: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  type: 'ROUTINE' | 'FOLLOW_UP' | 'EMERGENCY_TRIAGE' | 'TELECONSULT';
  reason: string;
  notes?: string;
  createdAt: string;
  patient: {
    id: string;
    patientId: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string;
    user: {
      firstName: string;
      lastName: string;
      phone?: string;
      email: string;
    };
    allergies?: Allergy[];
    vitals?: VitalSign[];
    assessments?: SymptomAssessment[];
  };
  doctor: {
    id: string;
    specialization: string;
    roomNumber: string;
    consultationFee: number;
    user: {
      firstName: string;
      lastName: string;
    };
    department: {
      name: string;
    };
  };
  department?: Department;
  triageRecord?: TriageRecord;
  encounter?: Encounter;
}

export interface TriageRecord {
  id: string;
  patientId: string;
  appointmentId?: string;
  recordedById: string;
  triageCategory: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE';
  painScale: number;
  mobilityStatus: string;
  vitalsSnapshotJson: string;
  nurseNotes: string;
  escalatedToDoctorId?: string;
  createdAt: string;
}

export interface LabCatalogItem {
  id: string;
  testCode: string;
  testName: string;
  department: string;
  sampleType: string;
  turnAroundHours: number;
  standardFee: number;
  normalRangeMin?: number;
  normalRangeMax?: number;
  unit: string;
  interpretation?: string;
}

export interface LabResult {
  id: string;
  labOrderId: string;
  catalogTestId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  technicianNotes?: string;
  reportedAt: string;
  catalogItem?: LabCatalogItem;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  doctorId: string;
  clinicalIndication: string;
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED';
  sampleCollectedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  patient: {
    patientId: string;
    gender: string;
    user: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  doctor: {
    user: {
      firstName: string;
      lastName: string;
    };
    department: {
      name: string;
    };
  };
  results: LabResult[];
}

export interface SymptomAssessment {
  id: string;
  patientId: string;
  sessionNumber: string;
  ageGroup: string;
  chiefComplaint: string;
  symptomsJson: string;
  followUpAnswersJson?: string;
  safetyAlertTriggered: boolean;
  emergencyReason?: string;
  aiUrgencyLevel: 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW';
  aiSummary: string;
  aiPossibleExplanationsJson: string;
  aiQuestionsForDoctorJson: string;
  aiReferencesJson: string;
  isAiGenerated: boolean;
  clinicianReviewStatus: 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED';
  clinicianNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  patient?: {
    patientId: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface Encounter {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  examinationNotes: string;
  diagnosis: string;
  icdCode?: string;
  treatmentPlan: string;
  followUpDate?: string;
  status: string;
  signedAt?: string;
  createdAt: string;
  doctor?: {
    user: {
      firstName: string;
      lastName: string;
    };
    department: {
      name: string;
    };
  };
  medications?: Medication[];
}

export interface MedicalDocument {
  id: string;
  title: string;
  documentType: 'LAB_REPORT' | 'VISIT_SUMMARY' | 'DISCHARGE_SUMMARY' | 'PRESCRIPTION';
  patientId: string;
  fileSize?: string;
  verificationHash?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPOINTMENT' | 'LAB_RESULT' | 'TRIAGE_ALERT' | 'SYSTEM';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  category: string;
  sourceOrganization: string;
  sourceUrl: string;
  publicationDate: string;
  verificationDate: string;
  reviewStatus: string;
  summary: string;
  keyPoints: string[];
}
