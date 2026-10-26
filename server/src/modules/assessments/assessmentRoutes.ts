import { Router, Response } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { evaluateSymptoms, AssessmentInput } from '../../services/aiService';
import { logAuditEvent } from '../../middleware/auditLogger';

const router = Router();

// 1. Evaluate symptoms (Runs safety red-flag screening + structured decision support)
router.post('/evaluate', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ageGroup, gender, chiefComplaint, symptoms, medicalHistory, medications, allergies, followUpResponses } = req.body;

    if (!chiefComplaint && (!symptoms || symptoms.length === 0)) {
      res.status(400).json({ error: 'Chief complaint or at least one symptom is required' });
      return;
    }

    const input: AssessmentInput = {
      ageGroup: ageGroup || 'Adult (18-64)',
      gender,
      chiefComplaint: chiefComplaint || (symptoms[0]?.symptom || 'General checkup'),
      symptoms: symptoms || [],
      medicalHistory: medicalHistory || [],
      medications: medications || [],
      allergies: allergies || [],
      followUpResponses: followUpResponses || {},
    };

    const evaluation = await evaluateSymptoms(input);

    res.json({
      evaluation,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Evaluate symptoms error:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate symptoms' });
  }
});

// 2. Save assessment to patient record
router.post('/save', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let patientId = req.user?.patientId;
    if (!patientId && req.body.patientId) {
      patientId = req.body.patientId;
    }

    if (!patientId) {
      res.status(400).json({ error: 'Patient profile required to save assessment' });
      return;
    }

    const {
      ageGroup,
      chiefComplaint,
      symptoms,
      followUpAnswers,
      safetyAlertTriggered,
      emergencyReason,
      aiUrgencyLevel,
      aiSummary,
      aiPossibleExplanations,
      aiQuestionsForDoctor,
      aiReferences,
    } = req.body;

    const count = await prisma.symptomAssessment.count();
    const sessionNumber = `SA-${new Date().getFullYear()}-${String(count + 1001).padStart(4, '0')}`;

    const assessment = await prisma.symptomAssessment.create({
      data: {
        patientId,
        sessionNumber,
        ageGroup: ageGroup || 'Adult',
        chiefComplaint: chiefComplaint || 'Symptom Consultation',
        symptomsJson: JSON.stringify(symptoms || []),
        followUpAnswersJson: JSON.stringify(followUpAnswers || {}),
        safetyAlertTriggered: !!safetyAlertTriggered,
        emergencyReason: emergencyReason || null,
        aiUrgencyLevel: aiUrgencyLevel || 'MODERATE',
        aiSummary: aiSummary || '',
        aiPossibleExplanationsJson: JSON.stringify(aiPossibleExplanations || []),
        aiQuestionsForDoctorJson: JSON.stringify(aiQuestionsForDoctor || []),
        aiReferencesJson: JSON.stringify(aiReferences || []),
        isAiGenerated: true,
        clinicianReviewStatus: 'PENDING',
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'AI Assessment Saved',
        message: `Assessment ${sessionNumber} has been securely saved to your medical record for clinical review.`,
        type: 'SYSTEM',
        actionUrl: `/patient/assessments`,
      },
    });

    await logAuditEvent({
      userId: req.user!.id,
      userEmail: req.user!.email,
      userRole: req.user!.role,
      action: 'CREATE',
      entityType: 'ASSESSMENT',
      entityId: assessment.id,
      details: `Saved symptom assessment session ${sessionNumber}. Urgency: ${aiUrgencyLevel}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Assessment saved to patient record',
      assessment,
    });
  } catch (error: any) {
    console.error('Save assessment error:', error);
    res.status(500).json({ error: error.message || 'Failed to save assessment' });
  }
});

// 3. Get assessments for a patient
router.get('/patient/:patientId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string;

    // Check permissions
    if (req.user?.role === 'PATIENT' && req.user.patientId !== patientId) {
      res.status(403).json({ error: 'You are only authorized to view your own assessments' });
      return;
    }

    const assessments = await prisma.symptomAssessment.findMany({
      where: { patientId },
      include: {
        reviewedByDoctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assessments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list assessments' });
  }
});

// 4. Get single assessment by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const assessment = await prisma.symptomAssessment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        reviewedByDoctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    // Check patient isolation
    if (req.user?.role === 'PATIENT' && req.user.patientId !== assessment.patientId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get assessment' });
  }
});

export default router;
