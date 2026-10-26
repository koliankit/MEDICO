import {
  mockDepartments,
  mockDoctors,
  mockArticles,
  mockDemoUsers,
  mockPatientProfile,
  mockLabCatalog,
  mockLabOrders,
  mockAppointments,
  mockAssessments,
  mockTriageQueue,
  mockNotifications,
  mockAdminStats,
  mockSystemHealth,
  mockAuditLogs,
  evaluateSymptomsOffline,
} from './mockData';
import { UserRole } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// In-memory persistent state during user session
let appointmentsState = [...mockAppointments];
let labOrdersState = [...mockLabOrders];
let assessmentsState = [...mockAssessments];
let vitalsState = [...mockPatientProfile.vitals];
let notificationsState = [...mockNotifications];
let auditLogsState = [...mockAuditLogs];

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  mockFallback?: () => T | Promise<T>
): Promise<T> {
  const token = localStorage.getItem('chp_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';

    // If server returned HTML (e.g. Vercel SPA rewrite falling back to index.html)
    // or status is 404/500+, and we have a mock fallback, use mock fallback!
    if (!contentType.includes('application/json') || response.status === 404 || response.status >= 500) {
      if (mockFallback) {
        console.warn(`[CHP Resilience] Backend not answering JSON on ${endpoint}. Serving robust demo data.`);
        return await mockFallback();
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      if (mockFallback) {
        return await mockFallback();
      }
      throw new ApiError((data && data.error) || 'A network error occurred', response.status);
    }

    return data as T;
  } catch (err: any) {
    // If backend is unreachable (offline, CORS, network error)
    if (mockFallback) {
      console.warn(`[CHP Resilience] Network call to ${endpoint} failed. Using offline fallback.`);
      return await mockFallback();
    }
    throw new ApiError(err.message || 'Network request failed', 0);
  }
}

// Helper to find current user based on token
function getDemoUserFromToken(): any {
  const token = localStorage.getItem('chp_auth_token');
  if (token) {
    for (const [role, user] of Object.entries(mockDemoUsers)) {
      if (token.includes(role.toLowerCase())) {
        return user;
      }
    }
  }
  return mockDemoUsers.PATIENT;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: any }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        },
        () => {
          const email = credentials.email.toLowerCase();
          let matchedRole: UserRole = 'PATIENT';
          if (email.includes('anita') || email.includes('doc')) matchedRole = 'DOCTOR';
          else if (email.includes('nurse') || email.includes('sneha')) matchedRole = 'NURSE';
          else if (email.includes('lab') || email.includes('shinde')) matchedRole = 'LAB_STAFF';
          else if (email.includes('admin') || email.includes('vikram')) matchedRole = 'ADMIN';
          else if (email.includes('reception')) matchedRole = 'RECEPTIONIST';

          const user = mockDemoUsers[matchedRole];
          const token = `chp_demo_${matchedRole.toLowerCase()}_token_${Date.now()}`;
          return { token, user };
        }
      ),

    demoLogin: (role: string) =>
      request<{ token: string; user: any; isDemoSession: boolean }>(
        '/auth/demo-login',
        {
          method: 'POST',
          body: JSON.stringify({ role }),
        },
        () => {
          const matchedRole = (role.toUpperCase() as UserRole) || 'PATIENT';
          const user = mockDemoUsers[matchedRole] || mockDemoUsers.PATIENT;
          const token = `chp_demo_${matchedRole.toLowerCase()}_token_${Date.now()}`;
          return { token, user, isDemoSession: true };
        }
      ),

    register: (userData: any) =>
      request<{ token: string; user: any; message: string }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(userData),
        },
        () => {
          const user = {
            id: `user-${Date.now()}`,
            email: userData.email,
            role: (userData.role as UserRole) || 'PATIENT',
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            patientId: `CHP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          };
          const token = `chp_demo_patient_token_${Date.now()}`;
          return { token, user, message: 'Account registered successfully (Demo Environment)' };
        }
      ),

    me: () =>
      request<any>(
        '/auth/me',
        {},
        () => getDemoUserFromToken()
      ),
  },

  // Departments
  departments: {
    getAll: () =>
      request<any[]>(
        '/departments',
        {},
        () => [...mockDepartments]
      ),
  },

  // Doctors
  doctors: {
    getAll: (departmentId?: string) =>
      request<any[]>(
        departmentId ? `/doctors?departmentId=${departmentId}` : '/doctors',
        {},
        () => {
          if (departmentId) {
            return mockDoctors.filter((doc) => doc.departmentId === departmentId);
          }
          return [...mockDoctors];
        }
      ),
    getById: (id: string) =>
      request<any>(
        `/doctors/${id}`,
        {},
        () => mockDoctors.find((d) => d.id === id) || mockDoctors[0]
      ),
    getQueueToday: () =>
      request<any[]>(
        '/doctors/queue/today',
        {},
        () => appointmentsState
      ),
    createEncounter: (encounterData: any) =>
      request<any>(
        '/doctors/encounters',
        {
          method: 'POST',
          body: JSON.stringify(encounterData),
        },
        () => {
          const newEncounter = {
            id: `enc-${Date.now()}`,
            ...encounterData,
            status: 'COMPLETED',
            signedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          return newEncounter;
        }
      ),
    reviewAssessment: (id: string, data: { status: string; clinicianNotes?: string }) =>
      request<any>(
        `/doctors/assessments/${id}/review`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => {
          assessmentsState = assessmentsState.map((a) =>
            a.id === id
              ? {
                  ...a,
                  clinicianReviewStatus: data.status as any,
                  clinicianNotes: data.clinicianNotes,
                  reviewedAt: new Date().toISOString(),
                }
              : a
          );
          return { message: 'Assessment reviewed successfully' };
        }
      ),
  },

  // Patients
  patients: {
    getMe: () =>
      request<any>(
        '/patients/me',
        {},
        () => ({
          ...mockPatientProfile,
          appointments: appointmentsState,
          labOrders: labOrdersState,
          assessments: assessmentsState,
          vitals: vitalsState,
        })
      ),
    updateMe: (data: any) =>
      request<any>(
        '/patients/me',
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
        () => {
          Object.assign(mockPatientProfile, data);
          return mockPatientProfile;
        }
      ),
    search: (query?: string) =>
      request<any[]>(
        query ? `/patients?search=${encodeURIComponent(query)}` : '/patients',
        {},
        () => [mockPatientProfile]
      ),
    getById: (id: string) =>
      request<any>(
        `/patients/${id}`,
        {},
        () => mockPatientProfile
      ),
    recordVitals: (patientId: string, vitalsData: any) =>
      request<any>(
        `/patients/${patientId}/vitals`,
        {
          method: 'POST',
          body: JSON.stringify(vitalsData),
        },
        () => {
          const newVital = {
            id: `vit-${Date.now()}`,
            patientId,
            recordedById: 'user-nurse-sneha',
            recordedByRole: 'NURSE',
            ...vitalsData,
            recordedAt: new Date().toISOString(),
          };
          vitalsState.unshift(newVital);
          return newVital;
        }
      ),
  },

  // Appointments
  appointments: {
    getAll: (params?: { date?: string; doctorId?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(
        query ? `/appointments?${query}` : '/appointments',
        {},
        () => {
          let list = [...appointmentsState];
          if (params?.doctorId) list = list.filter((a) => a.doctorId === params.doctorId);
          if (params?.status) list = list.filter((a) => a.status === params.status);
          return list;
        }
      );
    },
    book: (bookingData: any) =>
      request<any>(
        '/appointments',
        {
          method: 'POST',
          body: JSON.stringify(bookingData),
        },
        () => {
          const doctor = mockDoctors.find((d) => d.id === bookingData.doctorId) || mockDoctors[0];
          const newAppt: any = {
            id: `appt-${Date.now()}`,
            patientId: mockPatientProfile.id,
            doctorId: doctor.id,
            departmentId: doctor.departmentId,
            appointmentDate: bookingData.appointmentDate || new Date().toISOString().split('T')[0],
            timeSlot: bookingData.timeSlot || '10:00 AM - 10:30 AM',
            status: 'SCHEDULED',
            type: bookingData.type || 'ROUTINE',
            reason: bookingData.reason || 'Medical consultation',
            notes: bookingData.notes || '',
            createdAt: new Date().toISOString(),
            doctor: {
              id: doctor.id,
              specialization: doctor.specialization,
              roomNumber: doctor.roomNumber,
              consultationFee: doctor.consultationFee,
              user: doctor.user,
              department: doctor.department,
            },
            patient: {
              id: mockPatientProfile.id,
              patientId: mockPatientProfile.patientId,
              gender: mockPatientProfile.gender,
              dateOfBirth: mockPatientProfile.dateOfBirth,
              bloodGroup: mockPatientProfile.bloodGroup,
              user: mockPatientProfile.user,
              allergies: mockPatientProfile.allergies,
              vitals: vitalsState,
            },
          };
          appointmentsState.unshift(newAppt);
          return newAppt;
        }
      ),
    updateStatus: (id: string, status: string, notes?: string) =>
      request<any>(
        `/appointments/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, notes }),
        },
        () => {
          appointmentsState = appointmentsState.map((a) =>
            a.id === id ? { ...a, status: status as any, notes: notes || a.notes } : a
          );
          return { message: 'Status updated successfully' };
        }
      ),
  },

  // AI Symptom Assessment
  assessments: {
    evaluate: (inputData: any) =>
      request<{ evaluation: any; evaluatedAt: string }>(
        '/assessments/evaluate',
        {
          method: 'POST',
          body: JSON.stringify(inputData),
        },
        () => ({
          evaluation: evaluateSymptomsOffline(inputData),
          evaluatedAt: new Date().toISOString(),
        })
      ),
    save: (assessmentData: any) =>
      request<any>(
        '/assessments/save',
        {
          method: 'POST',
          body: JSON.stringify(assessmentData),
        },
        () => {
          const sessionNumber = `SA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const newAssessment: any = {
            id: `sa-${Date.now()}`,
            patientId: mockPatientProfile.id,
            sessionNumber,
            ageGroup: assessmentData.ageGroup || 'Adult',
            chiefComplaint: assessmentData.chiefComplaint || 'Consultation',
            symptomsJson: JSON.stringify(assessmentData.symptoms || []),
            followUpAnswersJson: JSON.stringify(assessmentData.followUpAnswers || {}),
            safetyAlertTriggered: !!assessmentData.safetyAlertTriggered,
            emergencyReason: assessmentData.emergencyReason || null,
            aiUrgencyLevel: assessmentData.aiUrgencyLevel || 'MODERATE',
            aiSummary: assessmentData.aiSummary || '',
            aiPossibleExplanationsJson: JSON.stringify(assessmentData.aiPossibleExplanations || []),
            aiQuestionsForDoctorJson: JSON.stringify(assessmentData.aiQuestionsForDoctor || []),
            aiReferencesJson: JSON.stringify(assessmentData.aiReferences || []),
            isAiGenerated: true,
            clinicianReviewStatus: 'PENDING',
            createdAt: new Date().toISOString(),
            patient: {
              patientId: mockPatientProfile.patientId,
              user: mockPatientProfile.user,
            },
          };
          assessmentsState.unshift(newAssessment);
          return { message: 'Assessment saved to patient record', assessment: newAssessment };
        }
      ),
    getByPatient: (patientId: string) =>
      request<any[]>(
        `/assessments/patient/${patientId}`,
        {},
        () => assessmentsState
      ),
    getById: (id: string) =>
      request<any>(
        `/assessments/${id}`,
        {},
        () => assessmentsState.find((a) => a.id === id) || assessmentsState[0]
      ),
  },

  // Triage
  triage: {
    getQueue: () =>
      request<any[]>(
        '/triage/queue',
        {},
        () => mockTriageQueue
      ),
    record: (triageData: any) =>
      request<any>(
        '/triage',
        {
          method: 'POST',
          body: JSON.stringify(triageData),
        },
        () => ({
          id: `trg-${Date.now()}`,
          ...triageData,
          createdAt: new Date().toISOString(),
        })
      ),
  },

  // Laboratory
  laboratory: {
    getCatalog: () =>
      request<any[]>(
        '/laboratory/catalog',
        {},
        () => mockLabCatalog
      ),
    getOrders: (params?: { status?: string; patientId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(
        query ? `/laboratory/orders?${query}` : '/laboratory/orders',
        {},
        () => {
          let list = [...labOrdersState];
          if (params?.status && params.status !== 'ALL') {
            list = list.filter((o) => o.status === params.status);
          }
          return list;
        }
      );
    },
    createOrder: (orderData: any) =>
      request<any>(
        '/laboratory/orders',
        {
          method: 'POST',
          body: JSON.stringify(orderData),
        },
        () => {
          const newOrder: any = {
            id: `order-${Date.now()}`,
            orderNumber: `LAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            patientId: mockPatientProfile.id,
            doctorId: mockDoctors[0].id,
            clinicalIndication: orderData.clinicalIndication || 'Diagnostic assay',
            status: 'ORDERED',
            createdAt: new Date().toISOString(),
            patient: {
              patientId: mockPatientProfile.patientId,
              gender: mockPatientProfile.gender,
              user: mockPatientProfile.user,
            },
            doctor: {
              user: mockDoctors[0].user,
              department: { name: mockDoctors[0].department?.name || 'Cardiology' },
            },
            results: [],
          };
          labOrdersState.unshift(newOrder);
          return newOrder;
        }
      ),
    updateStatus: (id: string, status: string) =>
      request<any>(
        `/laboratory/orders/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        () => {
          labOrdersState = labOrdersState.map((o) =>
            o.id === id ? { ...o, status: status as any } : o
          );
          return { message: 'Status updated' };
        }
      ),
    enterResults: (id: string, results: any[]) =>
      request<any>(
        `/laboratory/orders/${id}/results`,
        {
          method: 'POST',
          body: JSON.stringify({ results }),
        },
        () => {
          labOrdersState = labOrdersState.map((o) =>
            o.id === id ? { ...o, results: results as any, status: 'COMPLETED' } : o
          );
          return { message: 'Results recorded successfully' };
        }
      ),
    verify: (id: string) =>
      request<any>(
        `/laboratory/orders/${id}/verify`,
        {
          method: 'POST',
        },
        () => {
          labOrdersState = labOrdersState.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: 'VERIFIED',
                  verifiedAt: new Date().toISOString(),
                }
              : o
          );
          return { message: 'Order certified and verified' };
        }
      ),
  },

  // Admin & Analytics
  admin: {
    getStats: () =>
      request<any>(
        '/admin/stats',
        {},
        () => mockAdminStats
      ),
    getUsers: (role?: string) =>
      request<any[]>(
        role ? `/admin/users?role=${role}` : '/admin/users',
        {},
        () => Object.values(mockDemoUsers)
      ),
    createUser: (data: any) =>
      request<any>(
        '/admin/users',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => ({ id: `usr-${Date.now()}`, ...data, createdAt: new Date().toISOString() })
      ),
    getAuditLogs: (params?: any) => {
      const query = new URLSearchParams(params || {}).toString();
      return request<any[]>(
        query ? `/admin/audit-logs?${query}` : '/admin/audit-logs',
        {},
        () => auditLogsState
      );
    },
    getSystemHealth: () =>
      request<any>(
        '/admin/system-health',
        {},
        () => mockSystemHealth
      ),
  },

  // Education
  education: {
    getArticles: () =>
      request<any[]>(
        '/education/articles',
        {},
        () => [...mockArticles]
      ),
  },

  // Notifications
  notifications: {
    getAll: () =>
      request<any[]>(
        '/notifications',
        {},
        () => notificationsState
      ),
    markRead: (id: string) =>
      request<any>(
        `/notifications/${id}/read`,
        {
          method: 'PATCH',
        },
        () => {
          notificationsState = notificationsState.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return { message: 'Marked as read' };
        }
      ),
    markAllRead: () =>
      request<any>(
        '/notifications/mark-all-read',
        {
          method: 'PATCH',
        },
        () => {
          notificationsState = notificationsState.map((n) => ({ ...n, isRead: true }));
          return { message: 'All marked read' };
        }
      ),
  },

  // Reports
  reports: {
    getLabReport: (orderId: string) =>
      request<any>(
        `/reports/lab/${orderId}`,
        {},
        () => labOrdersState.find((o) => o.id === orderId) || labOrdersState[0]
      ),
    getEncounterReport: (encounterId: string) =>
      request<any>(
        `/reports/encounter/${encounterId}`,
        {},
        () => ({
          id: encounterId,
          patient: mockPatientProfile,
          doctor: mockDoctors[0],
          chiefComplaint: 'Cardiovascular follow-up',
          diagnosis: 'Essential Hypertension (Stage 1) - Well Controlled',
          treatmentPlan: 'Continue Telmisartan 40mg. DASH diet recommended.',
          signedAt: new Date().toISOString(),
        })
      ),
  },
};
