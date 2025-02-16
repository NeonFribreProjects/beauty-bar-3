import { Router } from 'express';
import { prisma } from '../index';
import { sendBookingConfirmation, sendBookingStatusUpdate } from '../utils/email';

const router = Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    console.log('Fetching bookings');
    const bookings = await prisma.booking.findMany({
      include: {
        service: {
          include: {
            category: true
          }
        }
      }
    });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { service: true }
    });

    // Send status update emails
    if (status === 'confirmed' || status === 'cancelled') {
      await sendBookingStatusUpdate({
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        serviceName: booking.service.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: status
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Create booking
router.post('/', async (req, res) => {
  console.log('Received booking request:', req.body);
  try {
    const { serviceId, date, startTime, endTime, customerName, customerEmail, customerPhone } = req.body;
    
    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Customer details are required' });
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        customerName,  // No fallback
        customerEmail, // No fallback
        customerPhone, // No fallback
        date,
        startTime,
        endTime,
        status: 'pending'
      },
      include: { service: true }
    });

    // Send confirmation email
    await sendBookingConfirmation({
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
      serviceName: booking.service.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      customerPhone: booking.customerPhone
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

export { router as bookingRoutes }; 