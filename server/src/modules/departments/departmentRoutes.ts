import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        doctors: {
          where: { isAvailable: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { doctors: true, appointments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to list departments' });
  }
});

export default router;
