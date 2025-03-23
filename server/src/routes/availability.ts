import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { validateAvailability } from '../validators/availability';
import { generateTimeSlots } from '../utils/time';
import { redis } from '../utils/redis';
import { Request, Response } from 'express';

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
  const { serviceId } = req.params;
  const { date } = req.query;

  console.log(`[Availability Request] serviceId: ${serviceId}, date: ${date}`);

  if (!date || typeof date !== 'string') {
    console.error('[Validation Error] Invalid date parameter:', date);
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { category: true }
    });

    if (!service) {
      console.log(`[Service Not Found] serviceId: ${serviceId}`);
      return res.json([]);
    }

    console.log(`[Service Found]`, {
      serviceId,
      categoryId: service.categoryId,
      duration: service.duration
    });

    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();

    console.log(`[Date Processing]`, {
      originalDate: date,
      parsedDate: requestDate.toISOString(),
      dayOfWeek
    });

    const adminAvailability = await prisma.adminAvailability.findUnique({
      where: {
        categoryId_dayOfWeek: {
          categoryId: service.categoryId,
          dayOfWeek
        }
      }
    });

    console.log(`[Admin Availability]`, adminAvailability);

    if (!adminAvailability || !adminAvailability.isAvailable) {
      console.log(`[No Availability] Day ${dayOfWeek} not available`);
      return res.json([]);
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId,
        date: date,
        status: { not: 'cancelled' }
      }
    });

    console.log(`[Existing Bookings]`, existingBookings);

    const timeSlots = generateTimeSlots(
      adminAvailability.startTime,
      adminAvailability.endTime,
      Number(service.duration),
      adminAvailability.breakTime || 0,
      existingBookings
    );

    console.log(`[Generated Time Slots] Count: ${timeSlots.length}`);

    return res.json(timeSlots);

  } catch (error) {
    console.error('[Detailed Error]', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      serviceId,
      date
    });
    return res.status(500).json({ 
      error: 'Failed to get time slots',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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