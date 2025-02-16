import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export { router as categoryRoutes }; 