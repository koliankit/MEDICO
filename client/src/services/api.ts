const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('chp_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || 'A network error occurred', response.status);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    demoLogin: (role: string) =>
      request<{ token: string; user: any; isDemoSession: boolean }>('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    register: (userData: any) =>
      request<{ token: string; user: any; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => request<any>('/auth/me'),
  },

  // Departments
  departments: {
    getAll: () => request<any[]>('/departments'),
  },

  // Doctors
  doctors: {
    getAll: (departmentId?: string) =>
      request<any[]>(departmentId ? `/doctors?departmentId=${departmentId}` : '/doctors'),
    getById: (id: string) => request<any>(`/doctors/${id}`),
    getQueueToday: () => request<any[]>('/doctors/queue/today'),
    createEncounter: (encounterData: any) =>
      request<any>('/doctors/encounters', {
        method: 'POST',
        body: JSON.stringify(encounterData),
      }),
    reviewAssessment: (id: string, data: { status: string; clinicianNotes?: string }) =>
      request<any>(`/doctors/assessments/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Patients
  patients: {
    getMe: () => request<any>('/patients/me'),
    updateMe: (data: any) =>
      request<any>('/patients/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    search: (query?: string) =>
      request<any[]>(query ? `/patients?search=${encodeURIComponent(query)}` : '/patients'),
    getById: (id: string) => request<any>(`/patients/${id}`),
    recordVitals: (patientId: string, vitalsData: any) =>
      request<any>(`/patients/${patientId}/vitals`, {
        method: 'POST',
        body: JSON.stringify(vitalsData),
      }),
  },

  // Appointments
  appointments: {
    getAll: (params?: { date?: string; doctorId?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(query ? `/appointments?${query}` : '/appointments');
    },
    book: (bookingData: any) =>
      request<any>('/appointments', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      }),
    updateStatus: (id: string, status: string, notes?: string) =>
      request<any>(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }),
  },

  // AI Symptom Assessment
  assessments: {
    evaluate: (inputData: any) =>
      request<{ evaluation: any; evaluatedAt: string }>('/assessments/evaluate', {
        method: 'POST',
        body: JSON.stringify(inputData),
      }),
    save: (assessmentData: any) =>
      request<any>('/assessments/save', {
        method: 'POST',
        body: JSON.stringify(assessmentData),
      }),
    getByPatient: (patientId: string) => request<any[]>(`/assessments/patient/${patientId}`),
    getById: (id: string) => request<any>(`/assessments/${id}`),
  },

  // Triage
  triage: {
    getQueue: () => request<any[]>('/triage/queue'),
    record: (triageData: any) =>
      request<any>('/triage', {
        method: 'POST',
        body: JSON.stringify(triageData),
      }),
  },

  // Laboratory
  laboratory: {
    getCatalog: () => request<any[]>('/laboratory/catalog'),
    getOrders: (params?: { status?: string; patientId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(query ? `/laboratory/orders?${query}` : '/laboratory/orders');
    },
    createOrder: (orderData: any) =>
      request<any>('/laboratory/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/laboratory/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    enterResults: (id: string, results: any[]) =>
      request<any>(`/laboratory/orders/${id}/results`, {
        method: 'POST',
        body: JSON.stringify({ results }),
      }),
    verify: (id: string) =>
      request<any>(`/laboratory/orders/${id}/verify`, {
        method: 'POST',
      }),
  },

  // Admin & Analytics
  admin: {
    getStats: () => request<any>('/admin/stats'),
    getUsers: (role?: string) => request<any[]>(role ? `/admin/users?role=${role}` : '/admin/users'),
    createUser: (data: any) =>
      request<any>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAuditLogs: (params?: any) => {
      const query = new URLSearchParams(params || {}).toString();
      return request<any[]>(query ? `/admin/audit-logs?${query}` : '/admin/audit-logs');
    },
    getSystemHealth: () => request<any>('/admin/system-health'),
  },

  // Education
  education: {
    getArticles: () => request<any[]>('/education/articles'),
  },

  // Notifications
  notifications: {
    getAll: () => request<any[]>('/notifications'),
    markRead: (id: string) =>
      request<any>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllRead: () =>
      request<any>('/notifications/mark-all-read', {
        method: 'PATCH',
      }),
  },

  // Reports
  reports: {
    getLabReport: (orderId: string) => request<any>(`/reports/lab/${orderId}`),
    getEncounterReport: (encounterId: string) => request<any>(`/reports/encounter/${encounterId}`),
  },
};
