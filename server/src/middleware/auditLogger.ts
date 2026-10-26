import { prisma } from '../prisma';

export async function logAuditEvent(params: {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SIGN_OFF' | 'AI_REVIEW' | 'LOGIN' | 'EXPORT';
  entityType: 'PATIENT' | 'ENCOUNTER' | 'LAB_ORDER' | 'ASSESSMENT' | 'APPOINTMENT' | 'SYSTEM' | 'AUTH';
  entityId?: string;
  details: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        userRole: params.userRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
