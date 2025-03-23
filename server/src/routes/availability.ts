import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { validateAvailability } from '../validators/availability';
import { generateTimeSlots } from '../utils/time';
import { redis } from '../utils/redis';
import { startOfDay, parseISO } from 'date-fns';

const router = Router();

// Get service availability
router.get('/services/:serviceId', async (req, res) => {
  const { serviceId } = req.params;

  const availability = await prisma.serviceAvailability.findUnique({
    where: { serviceId },
    include: { service: true }
  });

  if (!availability) {
    return res.status(404).json({ error: 'Availability not found' });
  }

  res.json(availability);
});

// Get available time slots
router.get('/services/:serviceId/time-slots', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Parse the date string and normalize to start of day in UTC
    const requestDate = startOfDay(parseISO(date));
    const dayOfWeek = requestDate.getDay();
    
    // Create separate date objects for the query
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { category: true }
    });

    if (!service) {
      return res.json([]);
    }

    const adminAvailability = await prisma.adminAvailability.findUnique({
      where: {
        categoryId_dayOfWeek: {
          categoryId: service.categoryId,
          dayOfWeek
        }
      }
    });

    if (!adminAvailability || !adminAvailability.isAvailable) {
      return res.json([]);
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId,
        date: date, // Use the original date string as stored in DB
        status: { not: 'cancelled' }
      }
    });

    const timeSlots = generateTimeSlots(
      adminAvailability.startTime,
      adminAvailability.endTime,
      Number(service.duration),
      adminAvailability.breakTime || 0,
      existingBookings
    );

    res.json(timeSlots);

  } catch (error) {
    console.error('Error generating time slots:', error);
    res.status(500).json({ error: 'Failed to generate time slots' });
  }
});

// Update service availability (admin only)
router.put(
  '/services/:serviceId',
  authMiddleware,
  validateAvailability,
  async (req, res) => {
    const { serviceId } = req.params;
    const availabilityData = req.body;

    const updated = await prisma.serviceAvailability.upsert({
      where: { serviceId },
      update: availabilityData,
      create: { ...availabilityData, serviceId }
    });

    res.json(updated);
  }
);

router.get('/:category', async (req, res) => {
  try {
    const category = await prisma.category.findFirst({
      where: { name: req.params.category }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const availability = await prisma.adminAvailability.findMany({
      where: { categoryId: category.id }
    });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

router.put('/:category', async (req, res) => {
  const { category } = req.params;
  const data = req.body;

  try {
    // Get the category ID first
    const categoryRecord = await prisma.category.findFirst({
      where: { name: category }
    });

    if (!categoryRecord) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update or create availability
    const availability = await prisma.adminAvailability.upsert({
      where: {
        categoryId_dayOfWeek: {
          categoryId: categoryRecord.id,
          dayOfWeek: data.dayOfWeek
        }
      },
      update: {
        isAvailable: data.isAvailable,
        startTime: data.startTime,
        endTime: data.endTime,
        maxBookings: data.maxBookings,
        breakTime: data.breakTime
      },
      create: {
        categoryId: categoryRecord.id,
        ...data
      }
    });

    // Invalidate any cached time slots
    await redis.del(`timeslots:${categoryRecord.id}:*`);

    res.json(availability);
  } catch (error) {
    console.error('Failed to update availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Update blocked time routes to use BlockedDate model
router.get('/blocked/:category', async (req, res) => {
  try {
    const category = await prisma.category.findFirst({
      where: { name: req.params.category }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where: { categoryId: category.id }
    });
    res.json(blockedDates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocked dates' });
  }
});

router.post('/blocked/:category', async (req, res) => {
  try {
    const category = await prisma.category.findFirst({
      where: { name: req.params.category }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { date, startTime, endTime } = req.body;
    const blockedDate = await prisma.blockedDate.create({
      data: {
        date,
        startTime,
        endTime,
        reason: 'Admin blocked',
        categoryId: category.id
      }
    });
    res.json(blockedDate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blocked date' });
  }
});

router.delete('/blocked/:category/:id', async (req, res) => {
  try {
    await prisma.blockedDate.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blocked date' });
  }
});

export { router as availabilityRoutes }; 