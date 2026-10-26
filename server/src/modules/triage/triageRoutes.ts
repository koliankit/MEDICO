import { Router, Response } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import { logAuditEvent } from '../../middleware/auditLogger';

const router = Router();

// 1. Get triage queue (Checked-in or waiting patients)
router.get('/queue', authenticateToken, requireRole('NURSE', 'DOCTOR', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: todayStr,
        status: { in: ['SCHEDULED', 'CHECKED_IN'] },
      },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
            allergies: true,
            vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
          },
        },
        doctor: {
          include: { user: { select: { firstName: true, lastName: true } }, department: true },
        },
        triageRecord: true,
      },
      orderBy: { timeSlot: 'asc' },
    });

    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch triage queue' });
  }
});

// 2. Record Triage Assessment (Nurse)
router.post('/', authenticateToken, requireRole('NURSE'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      appointmentId,
      triageCategory, // RED, ORANGE, YELLOW, GREEN, BLUE
      painScale,
      mobilityStatus,
      systolicBp,
      diastolicBp,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      temperatureF,
      nurseNotes,
      escalatedToDoctorId,
    } = req.body;

    if (!patientId || !triageCategory) {
      res.status(400).json({ error: 'Patient ID and triage category are required' });
      return;
    }

    // Record Vitals snapshot
    const vitalsSnapshot = {
      systolicBp,
      diastolicBp,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      temperatureF,
      recordedAt: new Date().toISOString(),
    };

    // Save vital sign to patient record as well
    if (systolicBp && diastolicBp) {
      await prisma.vitalSign.create({
        data: {
          patientId,
          recordedById: req.user!.id,
          recordedByRole: 'NURSE',
          systolicBp: parseInt(systolicBp, 10),
          diastolicBp: parseInt(diastolicBp, 10),
          heartRate: parseInt(heartRate || '75', 10),
          respiratoryRate: parseInt(respiratoryRate || '16', 10),
          oxygenSaturation: parseFloat(oxygenSaturation || '98'),
          temperatureF: parseFloat(temperatureF || '98.6'),
          painScore: parseInt(painScale || '0', 10),
          notes: `Triage intake: ${nurseNotes || ''}`,
        },
      });
    }

    const triageRecord = await prisma.triageRecord.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        recordedById: req.user!.id,
        triageCategory,
        painScale: parseInt(painScale || '0', 10),
        mobilityStatus: mobilityStatus || 'Ambulatory',
        vitalsSnapshotJson: JSON.stringify(vitalsSnapshot),
        nurseNotes: nurseNotes || '',
        escalatedToDoctorId: escalatedToDoctorId || null,
      },
    });

    // Update appointment status to CHECKED_IN if not already
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CHECKED_IN' },
      });
    }

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'CREATE',
      entityType: 'PATIENT',
      entityId: patientId,
      details: `Nurse triage completed: Category ${triageCategory}, Pain: ${painScale}/10`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Triage assessment saved successfully',
      triageRecord,
    });
  } catch (error: any) {
    console.error('Triage error:', error);
    res.status(500).json({ error: error.message || 'Failed to save triage assessment' });
  }
});

export default router;
