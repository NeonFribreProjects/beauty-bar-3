import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get featured services
router.get('/Featured', async (req: Request, res: Response) => {
  try {
    const featuredServices = await prisma.service.findMany({
      where: {
        featured: true,
        active: true  // Add this if you want only active services
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'  // Optional: sort by newest first
      }
    });
    
    if (!featuredServices.length) {
      return res.json([]);  // Return empty array instead of 404
    }

    res.json(featuredServices);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export const serviceRoutes = router; 