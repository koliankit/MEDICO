import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/authRoutes';
import patientRoutes from './modules/patients/patientRoutes';
import doctorRoutes from './modules/doctors/doctorRoutes';
import departmentRoutes from './modules/departments/departmentRoutes';
import appointmentRoutes from './modules/appointments/appointmentRoutes';
import assessmentRoutes from './modules/assessments/assessmentRoutes';
import triageRoutes from './modules/triage/triageRoutes';
import laboratoryRoutes from './modules/laboratory/laboratoryRoutes';
import adminRoutes from './modules/admin/adminRoutes';
import educationRoutes from './modules/education/educationRoutes';
import notificationRoutes from './modules/notifications/notificationRoutes';
import reportRoutes from './modules/reports/reportRoutes';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'City Hospital Pune - AI-Assisted Medical Diagnostic & Healthcare Management System',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    demoMode: true,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
