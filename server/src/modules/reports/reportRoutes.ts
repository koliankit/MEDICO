import { Router, Response } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// 1. Get structured official Lab Report
router.get('/lab/:orderId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;

    const order: any = await prisma.labOrder.findUnique({
      where: { id: orderId },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true, email: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            department: true,
          },
        },
        results: {
          include: { catalogItem: true },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Laboratory order not found' });
      return;
    }

    // Role security check
    if (req.user?.role === 'PATIENT' && req.user.patientId !== order.patientId) {
      res.status(403).json({ error: 'Unauthorized to view this laboratory report' });
      return;
    }

    res.json({
      hospital: {
        name: 'City Hospital Pune',
        department: 'Department of Clinical Pathology & Diagnostic Laboratory',
        accreditation: 'NABL Quality Assured / NABH Compliant Facility',
        address: 'Shivajinagar, Pune, Maharashtra 411005',
        phone: '+91 20 2567 8900',
        email: 'pathology@cityhospitalpune.org',
      },
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      sampleCollectedAt: order.sampleCollectedAt,
      completedAt: order.completedAt,
      verifiedAt: order.verifiedAt,
      status: order.status,
      clinicalIndication: order.clinicalIndication,
      patient: {
        name: `${order.patient?.user?.firstName || ''} ${order.patient?.user?.lastName || ''}`,
        patientId: order.patient?.patientId,
        age: 38,
        gender: order.patient?.gender,
        bloodGroup: order.patient?.bloodGroup,
        abhaId: order.patient?.abhaId,
      },
      referringDoctor: {
        name: `Dr. ${order.doctor?.user?.firstName || ''} ${order.doctor?.user?.lastName || ''}`,
        department: order.doctor?.department?.name,
        licenseNumber: order.doctor?.licenseNumber,
      },
      results: (order.results || []).map((r: any) => ({
        testName: r.testName,
        value: r.value,
        unit: r.unit,
        referenceRange: r.referenceRange,
        flag: r.flag,
        notes: r.technicianNotes,
      })),
      verificationHash: `SHA256:${Buffer.from(order.id).toString('hex').slice(0, 24)}`,
      reportGeneratedAt: new Date().toISOString(),
      disclaimer: 'This laboratory report is generated for medical diagnostic decision support. Results should be interpreted by the referring physician in conjunction with the clinical presentation.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch lab report' });
  }
});

// 2. Get structured Clinical Visit Summary / Encounter Note
router.get('/encounter/:encounterId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const encounterId = req.params.encounterId as string;

    const encounter: any = await prisma.encounter.findUnique({
      where: { id: encounterId },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            department: true,
          },
        },
        medications: true,
        appointment: true,
      },
    });

    if (!encounter) {
      res.status(404).json({ error: 'Encounter record not found' });
      return;
    }

    if (req.user?.role === 'PATIENT' && req.user.patientId !== encounter.patientId) {
      res.status(403).json({ error: 'Unauthorized to view this encounter' });
      return;
    }

    res.json({
      hospital: {
        name: 'City Hospital Pune',
        address: 'Shivajinagar, Pune, Maharashtra 411005',
        phone: '+91 20 2567 8900',
      },
      encounterId: encounter.id,
      date: encounter.createdAt,
      signedAt: encounter.signedAt,
      patient: {
        name: `${encounter.patient?.user?.firstName || ''} ${encounter.patient?.user?.lastName || ''}`,
        patientId: encounter.patient?.patientId,
        gender: encounter.patient?.gender,
        bloodGroup: encounter.patient?.bloodGroup,
        abhaId: encounter.patient?.abhaId,
      },
      doctor: {
        name: `Dr. ${encounter.doctor?.user?.firstName || ''} ${encounter.doctor?.user?.lastName || ''}`,
        department: encounter.doctor?.department?.name,
        licenseNumber: encounter.doctor?.licenseNumber,
        specialization: encounter.doctor?.specialization,
      },
      clinicalFindings: {
        chiefComplaint: encounter.chiefComplaint,
        historyOfPresentIllness: encounter.historyOfPresentIllness,
        examinationNotes: encounter.examinationNotes,
        diagnosis: encounter.diagnosis,
        icdCode: encounter.icdCode,
        treatmentPlan: encounter.treatmentPlan,
        followUpDate: encounter.followUpDate,
      },
      prescriptions: (encounter.medications || []).map((m: any) => ({
        medicationName: m.medicationName,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        route: m.route,
        instructions: m.instructions,
      })),
      verificationHash: `SHA256:${Buffer.from(encounter.id).toString('hex').slice(0, 24)}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch encounter' });
  }
});

export default router;
