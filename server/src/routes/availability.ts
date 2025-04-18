import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { validateAvailability } from '../validators/availability';
import { generateTimeSlots } from '../utils/time';
import { redis } from '../utils/redis';
import { DateTime } from 'luxon';
import { sendBookingConfirmation } from '../utils/email';

const router = Router();

// Get service availability
router.get('/services/:serviceId', async (req: Request, res: Response) => {
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

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { category: true }
    });

    if (!service) return res.json([]);

    const bizZone = 'America/Toronto';
    const dt = DateTime.fromISO(date, { zone: bizZone });
    const dayOfWeek = dt.weekday % 7; // Convert Luxon's 1-7 to 0-6

    // Get admin availability for this day
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

    // Check existing bookings using DateTime fields
    const startOfDay = dt.startOf('day').toJSDate();
    const endOfDay = dt.endOf('day').toJSDate();
    const bookings = await prisma.booking.findMany({
      where: {
        serviceId,
        appointmentStart: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: { not: 'cancelled' }
      }
    });

    const timeSlots = generateTimeSlots(
      adminAvailability.startTime,
      adminAvailability.endTime,
      Number(service.duration),
      adminAvailability.breakTime || 0,
      bookings,
      date
    );

    return res.json(timeSlots);

  } catch (error) {
    console.error('[Error]', { error, date, serviceId });
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
  async (req: Request, res: Response) => {
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

router.get('/:category', async (req: Request, res: Response) => {
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

router.put('/:category', async (req: Request, res: Response) => {
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
router.get('/blocked/:category', async (req: Request, res: Response) => {
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

router.post('/blocked/:category', async (req: Request, res: Response) => {
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

router.delete('/blocked/:category/:id', async (req: Request, res: Response) => {
  try {
    await prisma.blockedDate.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blocked date' });
  }
});

router.post('/bookings', async (req: Request, res: Response) => {
  try {
    console.log('[Booking Request]', {
      ...req.body,
      customerEmail: '***@***.com' // Mask sensitive data in logs
    });

    const { serviceId, date, startTime, endTime, customerName, customerEmail, customerPhone } = req.body;

    // Convert date and time strings to UTC DateTime
    const bizZone = 'America/Toronto';
    const startDateTime = DateTime.fromFormat(
      `${date} ${startTime}`, 
      'yyyy-MM-dd HH:mm', 
      { zone: bizZone }
    ).toUTC();
    
    const endDateTime = DateTime.fromFormat(
      `${date} ${endTime}`, 
      'yyyy-MM-dd HH:mm', 
      { zone: bizZone }
    ).toUTC();

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        appointmentStart: startDateTime.toJSDate(),
        appointmentEnd: endDateTime.toJSDate(),
        customerName,
        customerEmail,
        customerPhone,
        status: 'pending'
      },
      include: {
        service: {
          include: {
            category: true
          }
        }
      }
    });

    // Send email confirmation
    try {
      console.log('[Sending Email] Starting email confirmation process');
      
      await sendBookingConfirmation({
        customerEmail,
        customerName,
        serviceName: booking.service.name,
        appointmentStart: booking.appointmentStart,
        appointmentEnd: booking.appointmentEnd,
        customerPhone
      });

      console.log('[Email Sent] Successfully sent booking confirmation');
      
      // Store email status in Redis for monitoring
      await redis.setex(
        `email:booking:${booking.id}`,
        86400, // 24 hours
        JSON.stringify({
          sent: true,
          timestamp: new Date().toISOString(),
          type: 'booking_confirmation'
        })
      );

    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't return error to client, booking was still created
    }

    return res.json(booking);
  } catch (error) {
    console.error('[Booking Error]', error);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

export { router as availabilityRoutes }; 