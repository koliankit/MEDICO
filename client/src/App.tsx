import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { DepartmentsPage } from './pages/public/DepartmentsPage';
import { DoctorsPage } from './pages/public/DoctorsPage';
import { EducationPage } from './pages/public/EducationPage';
import { EmergencyPage } from './pages/public/EmergencyPage';
import { BookingPage } from './pages/public/BookingPage';
import { SymptomAssessmentWizard } from './pages/assessment/SymptomAssessmentWizard';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Patient Portal Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientAppointmentsPage } from './pages/patient/PatientAppointmentsPage';
import { PatientVitalsPage } from './pages/patient/PatientVitalsPage';
import { PatientLabsPage } from './pages/patient/PatientLabsPage';
import { PatientDocumentsPage } from './pages/patient/PatientDocumentsPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorConsultationPage } from './pages/doctor/DoctorConsultationPage';

// Nurse Pages
import { TriageDashboard } from './pages/nurse/TriageDashboard';

// Laboratory Pages
import { LaboratoryDashboard } from './pages/laboratory/LaboratoryDashboard';

// Admin & Analytics Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { HospitalAnalyticsPage } from './pages/analytics/HospitalAnalyticsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Layout Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/assessment" element={<SymptomAssessmentWizard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Authenticated Workspace Routes */}
          <Route element={<DashboardLayout />}>
            {/* Patient Routes */}
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/patient/vitals" element={<PatientVitalsPage />} />
            <Route path="/patient/medications" element={<PatientDashboard />} />
            <Route path="/patient/labs" element={<PatientLabsPage />} />
            <Route path="/patient/documents" element={<PatientDocumentsPage />} />
            <Route path="/patient/profile" element={<PatientProfilePage />} />

            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/queue" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<DoctorDashboard />} />
            <Route path="/doctor/consultation/:appointmentId" element={<DoctorConsultationPage />} />

            {/* Nurse Routes */}
            <Route path="/nurse" element={<TriageDashboard />} />
            <Route path="/nurse/patients" element={<TriageDashboard />} />

            {/* Laboratory Routes */}
            <Route path="/laboratory" element={<LaboratoryDashboard />} />
            <Route path="/laboratory/catalog" element={<LaboratoryDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/admin/users" element={<StaffManagementPage />} />
            <Route path="/admin/audit" element={<AuditLogsPage />} />

            {/* Analytics */}
            <Route path="/analytics" element={<HospitalAnalyticsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
