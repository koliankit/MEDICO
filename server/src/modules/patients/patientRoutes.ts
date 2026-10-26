import { Router, Response } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import { logAuditEvent } from '../../middleware/auditLogger';

const router = Router();

// 1. Get logged-in patient's full dashboard data
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.patientId) {
      res.status(404).json({ error: 'Patient profile not found for this account' });
      return;
    }

    const patient = await prisma.patient.findUnique({
      where: { id: req.user.patientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        allergies: true,
        medications: {
          orderBy: { startDate: 'desc' },
        },
        appointments: {
          include: {
            doctor: {
              include: {
                user: { select: { firstName: true, lastName: true } },
                department: true,
              },
            },
          },
          orderBy: { appointmentDate: 'desc' },
        },
        labOrders: {
          include: {
            doctor: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
            results: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        assessments: {
          orderBy: { createdAt: 'desc' },
        },
        consentRecords: true,
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient record not found' });
      return;
    }

    res.json(patient);
  } catch (error: any) {
    console.error('Fetch patient me error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch patient data' });
  }
});

// 2. Update logged-in patient's permissible contact details
router.put('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.patientId) {
      res.status(400).json({ error: 'Patient profile required' });
      return;
    }

    const { emergencyContactName, emergencyContactPhone, address, phone } = req.body;

    const updatedPatient = await prisma.patient.update({
      where: { id: req.user.patientId },
      data: {
        emergencyContactName,
        emergencyContactPhone,
        address,
      },
    });

    if (phone) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { phone },
      });
    }

    await logAuditEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'UPDATE',
      entityType: 'PATIENT',
      entityId: req.user.patientId,
      details: 'Patient updated self contact information',
      ipAddress: req.ip,
    });

    res.json({ message: 'Profile updated successfully', patient: updatedPatient });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// 3. Search and list patients (Staff only: Doctor, Nurse, Receptionist, Admin)
router.get('/', authenticateToken, requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const whereClause: any = {};
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { patientId: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { phone: { contains: search } } },
      ];
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        appointments: {
          take: 1,
          orderBy: { appointmentDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list patients' });
  }
});

// 4. Clinical view of single patient by ID (Staff with authorized scope)
router.get('/:id', authenticateToken, requireRole('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 15,
        },
        allergies: true,
        medications: {
          orderBy: { startDate: 'desc' },
        },
        appointments: {
          include: {
            doctor: {
              include: {
                user: { select: { firstName: true, lastName: true } },
                department: true,
              },
            },
          },
          orderBy: { appointmentDate: 'desc' },
        },
        encounters: {
          include: {
            doctor: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
            medications: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        labOrders: {
          include: {
            results: true,
            doctor: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        assessments: {
          orderBy: { createdAt: 'desc' },
        },
        triageRecords: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient record not found' });
      return;
    }

    // Record audit event for viewing patient clinical record
    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'VIEW',
      entityType: 'PATIENT',
      entityId: patient.id,
      details: `Clinical record accessed: ${patient.patientId} by ${req.user!.role}`,
      ipAddress: req.ip,
    });

    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch patient' });
  }
});

// 5. Record Vitals (Nurse, Doctor)
router.post('/:id/vitals', authenticateToken, requireRole('NURSE', 'DOCTOR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { systolicBp, diastolicBp, heartRate, respiratoryRate, oxygenSaturation, temperatureF, painScore, notes } = req.body;

    const vital = await prisma.vitalSign.create({
      data: {
        patientId: id,
        recordedById: req.user!.id,
        recordedByRole: req.user!.role,
        systolicBp: parseInt(systolicBp, 10),
        diastolicBp: parseInt(diastolicBp, 10),
        heartRate: parseInt(heartRate, 10),
        respiratoryRate: parseInt(respiratoryRate, 10),
        oxygenSaturation: parseFloat(oxygenSaturation),
        temperatureF: parseFloat(temperatureF),
        painScore: parseInt(painScore || '0', 10),
        notes,
      },
    });

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'CREATE',
      entityType: 'PATIENT',
      entityId: id,
      details: `Vitals recorded: BP ${systolicBp}/${diastolicBp}, HR ${heartRate}, SpO2 ${oxygenSaturation}%`,
      ipAddress: req.ip,
    });

    res.status(201).json(vital);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to record vitals' });
  }
});

export default router;
