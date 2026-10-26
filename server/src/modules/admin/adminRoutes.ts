import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import { logAuditEvent } from '../../middleware/auditLogger';

const router = Router();

// 1. Hospital-wide Operational Statistics & Analytics
router.get('/stats', authenticateToken, requireRole('ADMIN', 'RECEPTIONIST'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalDoctors,
      totalDepartments,
      todayAppointments,
      pendingLabs,
      verifiedLabs,
      recentAuditCount,
      triageRedCount,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count({ where: { isAvailable: true } }),
      prisma.department.count(),
      prisma.appointment.findMany({
        where: { appointmentDate: todayStr },
      }),
      prisma.labOrder.count({ where: { status: { in: ['ORDERED', 'SAMPLE_COLLECTED', 'PROCESSING'] } } }),
      prisma.labOrder.count({ where: { status: 'VERIFIED' } }),
      prisma.auditEvent.count(),
      prisma.triageRecord.count({ where: { triageCategory: 'RED' } }),
    ]);

    // Breakdown today's appointments by status
    const statusCounts: Record<string, number> = {
      SCHEDULED: 0,
      CHECKED_IN: 0,
      IN_CONSULTATION: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    todayAppointments.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    // Departmental workload
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { doctors: true, appointments: true },
        },
      },
    });

    res.json({
      overview: {
        totalPatients,
        totalDoctors,
        totalDepartments,
        todayAppointmentsTotal: todayAppointments.length,
        statusCounts,
        pendingLabs,
        verifiedLabs,
        recentAuditCount,
        criticalTriageCount: triageRedCount,
      },
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        floor: d.floor,
        doctorCount: d._count.doctors,
        appointmentCount: d._count.appointments,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch admin statistics' });
  }
});

// 2. User & Staff Management (Admin only)
router.get('/users', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    const where: any = {};
    if (role && typeof role === 'string') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        doctorProfile: {
          include: { department: true },
        },
        patientProfile: {
          select: { patientId: true, abhaId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list users' });
  }
});

// 3. Create staff user (Admin only)
router.post('/users', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName, phone, departmentId, specialization, qualifications, licenseNumber } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
      res.status(400).json({ error: 'Email, password, role, first name, and last name are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        phone,
      },
    });

    // If doctor role, create doctor profile
    if (role === 'DOCTOR' && departmentId) {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          licenseNumber: licenseNumber || `MCI-MH-${Math.floor(10000 + Math.random() * 90000)}`,
          departmentId,
          specialization: specialization || 'Consultant',
          qualifications: qualifications || 'MBBS',
          experienceYears: 5,
          consultationFee: 800.0,
          roomNumber: 'OPD-101',
          bio: 'Hospital Staff Clinician',
        },
      });
    }

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'CREATE',
      entityType: 'AUTH',
      entityId: user.id,
      details: `Created new staff user: ${email} with role ${role}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Staff member created successfully', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// 4. Audit Log Search and Filtering
router.get('/audit-logs', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, role, entityType, limit } = req.query;

    const where: any = {};
    if (action && typeof action === 'string') {
      where.action = action;
    }
    if (role && typeof role === 'string') {
      where.userRole = role;
    }
    if (entityType && typeof entityType === 'string') {
      where.entityType = entityType;
    }

    const take = limit ? parseInt(limit as string, 10) : 100;

    const logs = await prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    });

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to query audit logs' });
  }
});

// 5. System Health & Compliance Overview
router.get('/system-health', authenticateToken, requireRole('ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const consentCount = await prisma.consentRecord.count({ where: { granted: true } });
    const totalPatientCount = await prisma.patient.count();

    res.json({
      status: 'HEALTHY',
      serverUptimeSeconds: Math.floor(process.uptime()),
      database: 'Connected (SQLite Persistent ORM)',
      demoMode: true,
      dataProtection: {
        framework: 'Digital Personal Data Protection (DPDP) Act 2023 / ABDM India',
        totalConsentsRecorded: consentCount,
        consentCoveragePercentage: totalPatientCount > 0 ? Math.round((consentCount / totalPatientCount) * 100) : 100,
        encryptionInTransit: 'TLS 1.3 Compatible',
        accessControls: 'RBAC Active',
      },
      aiEngine: {
        status: 'Operational',
        safetyProtocols: 'India 112 Red Flag Interceptor Active',
        adapterMode: 'Deterministic Clinical Knowledge Adapter (Gemini Ready)',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get system health' });
  }
});

export default router;
