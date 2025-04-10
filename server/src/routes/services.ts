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
  } catch (error) {
    console.error('Error fetching featured services:', error);
    res.status(500).json({ 
      error: 'Failed to fetch featured services',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export const serviceRoutes = router; 