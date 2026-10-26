import { Router, Response } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import { logAuditEvent } from '../../middleware/auditLogger';

const router = Router();

// 1. Get appointments (Role-scoped)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, doctorId, status } = req.query;
    const where: any = {};

    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        res.status(400).json({ error: 'Patient profile required' });
        return;
      }
      where.patientId = req.user.patientId;
    } else if (req.user?.role === 'DOCTOR') {
      if (req.user.doctorId) {
        where.doctorId = req.user.doctorId;
      }
    }

    if (date && typeof date === 'string') {
      where.appointmentDate = date;
    }
    if (doctorId && typeof doctorId === 'string' && req.user?.role !== 'DOCTOR') {
      where.doctorId = doctorId;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
        department: true,
        triageRecord: true,
        encounter: true,
      },
      orderBy: [{ appointmentDate: 'desc' }, { timeSlot: 'asc' }],
    });

    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list appointments' });
  }
});

// 2. Book appointment with conflict detection
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId, departmentId, appointmentDate, timeSlot, reason, patientId: targetPatientId } = req.body;

    let patientId = req.user?.patientId;
    if (['RECEPTIONIST', 'ADMIN', 'NURSE'].includes(req.user!.role) && targetPatientId) {
      patientId = targetPatientId;
    }

    if (!patientId) {
      res.status(400).json({ error: 'Patient ID is required for booking' });
      return;
    }

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      res.status(400).json({ error: 'Doctor, appointment date, time slot, and reason are required' });
      return;
    }

    // Double Booking / Conflict Detection
    const existingBooking = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate,
        timeSlot,
        status: { notIn: ['CANCELLED'] },
      },
    });

    if (existingBooking) {
      res.status(409).json({
        error: `Schedule Conflict: The requested time slot (${timeSlot} on ${appointmentDate}) is already booked for this doctor. Please select another slot.`,
      });
      return;
    }

    // Auto-resolve departmentId if missing
    let deptId = departmentId;
    if (!deptId) {
      const doc = await prisma.doctor.findUnique({ where: { id: doctorId } });
      deptId = doc?.departmentId;
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        departmentId: deptId,
        appointmentDate,
        timeSlot,
        status: 'SCHEDULED',
        type: 'ROUTINE',
        reason,
      },
      include: {
        doctor: {
          include: { user: { select: { firstName: true, lastName: true } }, department: true },
        },
      },
    });

    // Notify patient
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Appointment Booked',
        message: `Your appointment with Dr. ${appointment.doctor.user.lastName} on ${appointmentDate} at ${timeSlot} is confirmed.`,
        type: 'APPOINTMENT',
        actionUrl: '/patient/appointments',
      },
    });

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'CREATE',
      entityType: 'APPOINTMENT',
      entityId: appointment.id,
      details: `Booked appointment with Dr. ${appointment.doctor.user.lastName} on ${appointmentDate} (${timeSlot})`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error: any) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: error.message || 'Failed to book appointment' });
  }
});

// 3. Update status (e.g. Receptionist check-in, Doctor in-consultation, Doctor complete)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    const validStatuses = ['SCHEDULED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const appointment: any = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (status === 'CHECKED_IN') {
      // Notify Doctor that patient has arrived and checked in
      await prisma.notification.create({
        data: {
          userId: appointment.doctor.userId,
          title: 'Patient Checked In',
          message: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName} has checked in for ${appointment.timeSlot}.`,
          type: 'TRIAGE_ALERT',
          actionUrl: '/doctor/queue',
        },
      });
    }

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'UPDATE',
      entityType: 'APPOINTMENT',
      entityId: id,
      details: `Appointment status updated to ${status}`,
      ipAddress: req.ip,
    });

    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update appointment' });
  }
});

export default router;
