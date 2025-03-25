import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { sendBookingConfirmation, sendBookingStatusUpdate } from '../utils/email';
import { DateTime } from 'luxon';

const router = Router();

// Get all bookings
router.get('/', async (req: Request, res: Response) => {
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

    // Format dates for response
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      appointmentStart: DateTime.fromJSDate(booking.appointmentStart)
        .setZone('America/Toronto')
        .toFormat('yyyy-MM-dd HH:mm'),
      appointmentEnd: DateTime.fromJSDate(booking.appointmentEnd)
        .setZone('America/Toronto')
        .toFormat('yyyy-MM-dd HH:mm')
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: {
          include: {
            category: true
          }
        }
      }
    });

    if (status === 'confirmed' || status === 'cancelled') {
      await sendBookingStatusUpdate({
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        serviceName: booking.service.name,
        appointmentStart: booking.appointmentStart,
        appointmentEnd: booking.appointmentEnd,
        status: status
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Create booking
router.post('/', async (req: Request, res: Response) => {
  try {
    const { serviceId, customerName, customerEmail, customerPhone, appointmentStart, appointmentEnd } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Customer details are required' });
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        customerName,
        customerEmail,
        customerPhone,
        appointmentStart: new Date(appointmentStart),
        appointmentEnd: new Date(appointmentEnd),
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

    await sendBookingConfirmation({
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
      serviceName: booking.service.name,
      appointmentStart: booking.appointmentStart,
      appointmentEnd: booking.appointmentEnd,
      customerPhone: booking.customerPhone
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

export { router as bookingRoutes }; 