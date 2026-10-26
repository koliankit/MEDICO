import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma';
import { config } from '../../config';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { logAuditEvent } from '../../middleware/auditLogger';

const router = Router();

// Register new patient account
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth, gender, bloodGroup, emergencyContactName, emergencyContactPhone, address, abhaId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'Email, password, first name, and last name are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const count = await prisma.patient.count();
    const patientId = `CHP-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'PATIENT',
        firstName,
        lastName,
        phone,
        patientProfile: {
          create: {
            patientId,
            dateOfBirth: dateOfBirth || '1990-01-01',
            gender: gender || 'Other',
            bloodGroup: bloodGroup || 'O+',
            emergencyContactName: emergencyContactName || 'Family Member',
            emergencyContactPhone: emergencyContactPhone || phone || '+91 98000 00000',
            address: address || 'Pune, Maharashtra',
            abhaId: abhaId || null,
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });

    // Create default DPDP Consent Record
    if (user.patientProfile) {
      await prisma.consentRecord.create({
        data: {
          patientId: user.patientProfile.id,
          consentType: 'DPDP_DATA_PROCESSING',
          granted: true,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
    }

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'CREATE',
      entityType: 'AUTH',
      entityId: user.id,
      details: `New patient registered: ${user.firstName} ${user.lastName} (${patientId})`,
      ipAddress: req.ip,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        patientId: user.patientProfile?.id,
        hospitalPatientId: user.patientProfile?.patientId,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Standard Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      details: `User login successful (${user.role})`,
      ipAddress: req.ip,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        patientId: user.patientProfile?.id,
        hospitalPatientId: user.patientProfile?.patientId,
        doctorId: user.doctorProfile?.id,
        doctorDepartment: user.doctorProfile?.department?.name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Quick-Switch Demo Login (Allows seamless instant testing of all 6 roles)
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, email } = req.body;

    let targetEmail = email;
    if (!targetEmail && role) {
      switch (role.toUpperCase()) {
        case 'ADMIN':
          targetEmail = 'admin@cityhospitalpune.org';
          break;
        case 'DOCTOR':
          targetEmail = 'dr.anita@cityhospitalpune.org';
          break;
        case 'NURSE':
          targetEmail = 'nurse.sneha@cityhospitalpune.org';
          break;
        case 'LAB_STAFF':
          targetEmail = 'lab.technician@cityhospitalpune.org';
          break;
        case 'RECEPTIONIST':
          targetEmail = 'reception@cityhospitalpune.org';
          break;
        case 'PATIENT':
        default:
          targetEmail = 'rahul.sharma@demo.com';
          break;
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        patientProfile: true,
        doctorProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: `Demo account for ${targetEmail} not found` });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      details: `Demo quick-switch login to role: ${user.role}`,
      ipAddress: req.ip,
    });

    res.json({
      token,
      isDemoSession: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        patientId: user.patientProfile?.id,
        hospitalPatientId: user.patientProfile?.patientId,
        doctorId: user.doctorProfile?.id,
        doctorDepartment: user.doctorProfile?.department?.name,
      },
    });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: error.message || 'Demo login failed' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        patientProfile: true,
        doctorProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      patientId: user.patientProfile?.id,
      hospitalPatientId: user.patientProfile?.patientId,
      doctorId: user.doctorProfile?.id,
      doctorDepartment: user.doctorProfile?.department?.name,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
});

export default router;
