import { DAYS_OF_WEEK } from '../lib/constants';

export async function up(prisma) {
  // Convert existing numeric days to string names
  const availabilities = await prisma.adminAvailability.findMany();
  
  for (const availability of availabilities) {
    await prisma.adminAvailability.update({
      where: { id: availability.id },
      data: {
        dayOfWeek: DAYS_OF_WEEK[Number(availability.dayOfWeek)]
      }
    });
  }
}

export async function down(prisma) {
  // Convert back to numbers if needed
  const availabilities = await prisma.adminAvailability.findMany();
  
  for (const availability of availabilities) {
    await prisma.adminAvailability.update({
      where: { id: availability.id },
      data: {
        dayOfWeek: DAYS_OF_WEEK.indexOf(availability.dayOfWeek).toString()
      }
    });
  }
} 