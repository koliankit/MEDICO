import { Router, Response } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import { logAuditEvent } from '../../middleware/auditLogger';

const router = Router();

// 1. Get laboratory test catalog (Public/Staff)
router.get('/catalog', async (req, res: Response): Promise<void> => {
  try {
    const catalog = await prisma.labCatalog.findMany({
      orderBy: { department: 'asc' },
    });
    res.json(catalog);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch lab catalog' });
  }
});

// 2. Get lab orders (Role-filtered)
router.get('/orders', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, patientId } = req.query;
    const where: any = {};

    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        res.status(400).json({ error: 'Patient profile required' });
        return;
      }
      where.patientId = req.user.patientId;
    } else if (patientId && typeof patientId === 'string') {
      where.patientId = patientId;
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const orders = await prisma.labOrder.findMany({
      where,
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
        results: {
          include: { catalogItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch lab orders' });
  }
});

// 3. Create lab order (Doctor or authorized staff)
router.post('/orders', authenticateToken, requireRole('DOCTOR', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId, clinicalIndication, testCatalogIds } = req.body;

    const docId = doctorId || req.user?.doctorId;
    if (!docId || !patientId || !testCatalogIds || !Array.isArray(testCatalogIds) || testCatalogIds.length === 0) {
      res.status(400).json({ error: 'Patient, Doctor, and at least one lab test are required' });
      return;
    }

    const orderCount = await prisma.labOrder.count();
    const orderNumber = `LAB-${new Date().getFullYear()}-${String(orderCount + 301).padStart(4, '0')}`;

    const order = await prisma.labOrder.create({
      data: {
        orderNumber,
        patientId,
        doctorId: docId,
        clinicalIndication: clinicalIndication || 'Diagnostic evaluation',
        status: 'ORDERED',
      },
    });

    for (const testId of testCatalogIds) {
      const catalogItem = await prisma.labCatalog.findUnique({ where: { id: testId } });
      if (catalogItem) {
        await prisma.labResult.create({
          data: {
            labOrderId: order.id,
            catalogTestId: catalogItem.id,
            testName: catalogItem.testName,
            value: 'Specimen Pending',
            unit: catalogItem.unit,
            referenceRange: catalogItem.normalRangeMin !== null && catalogItem.normalRangeMax !== null
              ? `${catalogItem.normalRangeMin} - ${catalogItem.normalRangeMax}`
              : 'Refer to lab guidance',
            flag: 'NORMAL',
          },
        });
      }
    }

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'CREATE',
      entityType: 'LAB_ORDER',
      entityId: order.id,
      details: `Created lab order ${orderNumber} for patient ${patientId}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Lab order created successfully', order });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create lab order' });
  }
});

// 4. Update order status (Lab staff: sample collected, processing)
router.patch('/orders/:id/status', authenticateToken, requireRole('LAB_STAFF', 'NURSE', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const data: any = { status };
    if (status === 'SAMPLE_COLLECTED') {
      data.sampleCollectedAt = new Date();
    } else if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }

    const updated = await prisma.labOrder.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
});

// 5. Enter/Update lab test results (Lab staff)
router.post('/orders/:id/results', authenticateToken, requireRole('LAB_STAFF', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { results } = req.body; // Array of { resultId, value, technicianNotes }

    if (!Array.isArray(results)) {
      res.status(400).json({ error: 'Results array is required' });
      return;
    }

    for (const r of results) {
      const existing = await prisma.labResult.findUnique({
        where: { id: r.resultId },
        include: { catalogItem: true },
      });

      if (existing) {
        let flag = 'NORMAL';
        const numVal = parseFloat(r.value);
        if (!isNaN(numVal) && existing.catalogItem.normalRangeMin !== null && existing.catalogItem.normalRangeMax !== null) {
          if (numVal < existing.catalogItem.normalRangeMin) {
            flag = 'LOW';
          } else if (numVal > existing.catalogItem.normalRangeMax) {
            flag = 'HIGH';
          }
        }

        await prisma.labResult.update({
          where: { id: r.resultId },
          data: {
            value: String(r.value),
            flag,
            technicianNotes: r.technicianNotes || null,
            reportedAt: new Date(),
          },
        });
      }
    }

    // Update order status to PROCESSING or COMPLETED
    await prisma.labOrder.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    res.json({ message: 'Lab results saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to record results' });
  }
});

// 6. Verify and approve lab report (Authorized Lab Specialist / Pathologist)
router.post('/orders/:id/verify', authenticateToken, requireRole('LAB_STAFF', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const order: any = await prisma.labOrder.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedById: req.user!.id,
        verifiedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
      },
    });

    // Create Medical Document for patient portal
    await prisma.medicalDocument.create({
      data: {
        title: `Official Laboratory Diagnostic Report - ${order.orderNumber}`,
        documentType: 'LAB_REPORT',
        patientId: order.patientId,
        labOrderId: order.id,
        fileSize: '156 KB',
        verificationHash: `SHA256:${Buffer.from(order.id).toString('hex').slice(0, 24)}`,
      },
    });

    // Notify patient
    await prisma.notification.create({
      data: {
        userId: order.patient.userId,
        title: 'Laboratory Results Verified',
        message: `Your diagnostic report for order ${order.orderNumber} has been verified by the pathology department and is ready for download.`,
        type: 'LAB_RESULT',
        actionUrl: '/patient/labs',
      },
    });

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'SIGN_OFF',
      entityType: 'LAB_ORDER',
      entityId: order.id,
      details: `Lab order ${order.orderNumber} verified and published by lab staff`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Lab report verified and published', order });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to verify lab order' });
  }
});

export default router;
