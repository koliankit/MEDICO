import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import { logAuditEvent } from '../../middleware/auditLogger';

const router = Router();

// 1. Get all doctors (Public & Internal)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.query;

    const where: any = { isAvailable: true };
    if (departmentId && typeof departmentId === 'string') {
      where.departmentId = departmentId;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        department: true,
      },
      orderBy: { experienceYears: 'desc' },
    });

    res.json(doctors);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list doctors' });
  }
});

// 2. Get single doctor
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        department: true,
      },
    });

    if (!doctor) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch doctor' });
  }
});

// 3. Get doctor's queue for today (Logged in doctor)
router.get('/queue/today', authenticateToken, requireRole('DOCTOR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      res.status(400).json({ error: 'Doctor profile not associated with this account' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: todayStr,
      },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
            vitals: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
            },
            assessments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        triageRecord: true,
        encounter: true,
      },
      orderBy: { timeSlot: 'asc' },
    });

    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch queue' });
  }
});

// 4. Create and Sign Clinical Consultation Encounter (Doctor workspace)
router.post('/encounters', authenticateToken, requireRole('DOCTOR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      res.status(400).json({ error: 'Doctor profile required' });
      return;
    }

    const {
      appointmentId,
      patientId,
      chiefComplaint,
      historyOfPresentIllness,
      examinationNotes,
      diagnosis,
      icdCode,
      treatmentPlan,
      followUpDate,
      prescriptions, // Array of { medicationName, dosage, frequency, duration, instructions }
      labOrderTests, // Array of test catalog IDs to order
    } = req.body;

    // Check appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const encounter = await prisma.encounter.create({
      data: {
        appointmentId,
        patientId,
        doctorId,
        chiefComplaint: chiefComplaint || appointment.reason,
        historyOfPresentIllness: historyOfPresentIllness || '',
        examinationNotes: examinationNotes || '',
        diagnosis,
        icdCode: icdCode || null,
        treatmentPlan,
        followUpDate: followUpDate || null,
        status: 'SIGNED',
        signedAt: new Date(),
      },
    });

    // Create Prescriptions if provided
    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      for (const rx of prescriptions) {
        await prisma.medication.create({
          data: {
            patientId,
            encounterId: encounter.id,
            medicationName: rx.medicationName,
            dosage: rx.dosage || 'Standard',
            frequency: rx.frequency || 'Once daily',
            route: rx.route || 'Oral',
            duration: rx.duration || '5 days',
            instructions: rx.instructions || null,
            prescribedBy: `Dr. ${req.user!.firstName} ${req.user!.lastName}`,
            status: 'ACTIVE',
          },
        });
      }
    }

    // Create Lab Orders if requested
    if (Array.isArray(labOrderTests) && labOrderTests.length > 0) {
      const orderCount = await prisma.labOrder.count();
      const orderNumber = `LAB-${new Date().getFullYear()}-${String(orderCount + 201).padStart(4, '0')}`;

      const labOrder = await prisma.labOrder.create({
        data: {
          orderNumber,
          patientId,
          doctorId,
          encounterId: encounter.id,
          clinicalIndication: `Ordered during consultation: ${diagnosis}`,
          status: 'ORDERED',
        },
      });

      for (const testId of labOrderTests) {
        const catItem = await prisma.labCatalog.findUnique({ where: { id: testId } });
        if (catItem) {
          await prisma.labResult.create({
            data: {
              labOrderId: labOrder.id,
              catalogTestId: catItem.id,
              testName: catItem.testName,
              value: 'Pending Specimen Collection',
              unit: catItem.unit,
              referenceRange: catItem.normalRangeMin !== null && catItem.normalRangeMax !== null
                ? `${catItem.normalRangeMin} - ${catItem.normalRangeMax}`
                : 'Clinical Correlation',
              flag: 'NORMAL',
            },
          });
        }
      }
    }

    // Update appointment status to COMPLETED
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });

    // Create medical document summary entry
    await prisma.medicalDocument.create({
      data: {
        title: `Clinical Visit Summary - ${diagnosis.slice(0, 30)}`,
        documentType: 'VISIT_SUMMARY',
        patientId,
        fileSize: '124 KB',
        verificationHash: `SHA256:${Buffer.from(encounter.id).toString('hex').slice(0, 24)}`,
      },
    });

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'SIGN_OFF',
      entityType: 'ENCOUNTER',
      entityId: encounter.id,
      details: `Clinical encounter signed by Dr. ${req.user!.lastName}. Diagnosis: ${diagnosis}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Consultation encounter finalized and signed successfully',
      encounter,
    });
  } catch (error: any) {
    console.error('Finalize encounter error:', error);
    res.status(500).json({ error: error.message || 'Failed to save encounter' });
  }
});

// 5. Doctor Review of AI Assessment (Independent review & clinician governance)
router.post('/assessments/:id/review', authenticateToken, requireRole('DOCTOR'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      res.status(400).json({ error: 'Doctor profile required' });
      return;
    }

    const id = req.params.id as string;
    const { status, clinicianNotes } = req.body; // status: ACCEPTED | MODIFIED | REJECTED

    if (!['ACCEPTED', 'MODIFIED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Status must be ACCEPTED, MODIFIED, or REJECTED' });
      return;
    }

    const assessment = await prisma.symptomAssessment.update({
      where: { id },
      data: {
        clinicianReviewStatus: status,
        clinicianNotes: clinicianNotes || '',
        reviewedById: doctorId,
        reviewedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'AI_REVIEW',
      entityType: 'ASSESSMENT',
      entityId: id,
      details: `Clinician decision on AI assessment: ${status}. Notes: ${clinicianNotes || 'None'}`,
      ipAddress: req.ip,
    });

    res.json({
      message: 'AI Assessment reviewed and clinician decision recorded',
      assessment,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to review assessment' });
  }
});

export default router;
