import { Prisma, PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

export async function up(prisma: PrismaClient) {
  // Get all existing bookings
  const bookings = await prisma.booking.findMany();
  
  // Convert each booking's date and time to DateTime
  for (const booking of bookings) {
    const bizZone = 'America/Toronto';
    const startDateTime = DateTime.fromFormat(
      `${booking.date} ${booking.startTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: bizZone }
    ).toUTC();

    const endDateTime = DateTime.fromFormat(
      `${booking.date} ${booking.endTime}`,
      'yyyy-MM-dd HH:mm',
      { zone: bizZone }
    ).toUTC();

    // Update booking with new DateTime fields
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        appointmentStart: startDateTime.toJSDate(),
        appointmentEnd: endDateTime.toJSDate()
      }
    });
  }
}

export async function down(prisma: PrismaClient) {
  // Revert changes if needed
} 