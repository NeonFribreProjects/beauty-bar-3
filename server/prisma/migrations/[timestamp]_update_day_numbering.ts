import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Convert existing data from 0-6 to 1-7 system
  const availabilities = await prisma.adminAvailability.findMany();
  
  for (const availability of availabilities) {
    const oldDay = availability.dayOfWeek;
    // Convert from Sunday=0 to Sunday=7
    const newDay = oldDay === 0 ? 7 : oldDay;
    
    await prisma.adminAvailability.update({
      where: { id: availability.id },
      data: { dayOfWeek: newDay }
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 