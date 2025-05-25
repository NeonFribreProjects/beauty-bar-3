import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        category: true
      }
    });
    console.log('Services fetched:', services);
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        availability: true
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

export { router as serviceRoutes }; 