import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    // Verify Admin table
    const adminCount = await prisma.admin.count();
    console.log('Admin table exists, count:', adminCount);

    // Verify Booking table
    const bookingCount = await prisma.booking.count();
    console.log('Booking table exists, count:', bookingCount);

    console.log('Database verification completed successfully');
  } catch (error) {
    console.error('Database verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase(); 