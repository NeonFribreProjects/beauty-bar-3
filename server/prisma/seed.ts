import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin'
    }
  });

  // Create categories
  const categories = [
    { name: 'Featured' },
    { name: 'Eyelash' },
    { name: 'Waxing' },
    { name: 'Foot Care' },
    { name: 'Hand Care' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  // Create services
  const services = [
    // Featured Services
    {
      name: 'Bio Gel Refill',
      duration: 90,
      price: 58,
      categoryName: 'Featured'
    },
    {
      name: 'Shellac Manicure',
      duration: 60,
      price: 40,
      discount: 'salt scrub',
      categoryName: 'Featured'
    },
    {
      name: 'Pedicure',
      duration: 40,
      price: 40,
      discount: 'salt scrub',
      categoryName: 'Featured'
    },
    {
      name: 'Full Legs & Bikini',
      duration: 50,
      price: 70,
      discount: 'Save 7%',
      categoryName: 'Featured'
    },
    // Eyelash Services
    {
      name: 'Eyelash Extensions',
      duration: 90,
      price: 80,
      categoryName: 'Eyelash'
    },
    {
      name: 'Eyelash Lift',
      duration: 60,
      price: 60,
      categoryName: 'Eyelash'
    },
    // Waxing Services
    {
      name: 'Full Legs Waxing',
      duration: 45,
      price: 50,
      categoryName: 'Waxing'
    },
    {
      name: 'Bikini Waxing',
      duration: 30,
      price: 40,
      categoryName: 'Waxing'
    },
    // Foot Care Services
    {
      name: 'Basic Pedicure',
      duration: 40,
      price: 35,
      categoryName: 'Foot Care'
    },
    {
      name: 'Spa Pedicure',
      duration: 60,
      price: 50,
      categoryName: 'Foot Care'
    },
    // Hand Care Services
    {
      name: 'Basic Manicure',
      duration: 30,
      price: 30,
      categoryName: 'Hand Care'
    },
    {
      name: 'Spa Manicure',
      duration: 60,
      price: 45,
      categoryName: 'Hand Care'
    }
  ];

  for (const service of services) {
    const category = await prisma.category.findFirst({
      where: { name: service.categoryName }
    });

    await prisma.service.upsert({
      where: {
        name_categoryId: {
          name: service.name,
          categoryId: category!.id
        }
      },
      update: {
        price: service.price,
        duration: service.duration,
        discount: service.discount
      },
      create: {
        name: service.name,
        duration: service.duration,
        price: service.price,
        discount: service.discount,
        categoryId: category!.id
      }
    });

    // Create availability after service is created
    await prisma.serviceAvailability.upsert({
      where: { serviceId: service.id },
      update: {},
      create: {
        serviceId: service.id,
        duration: 60,
        breakTime: 15,
        maxBookingsPerDay: 8,
        daysAvailable: [1, 2, 3, 4, 5, 6]
      }
    });
  }

  // Create business hours
  const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
  for (const day of days) {
    await prisma.businessHours.upsert({
      where: { id: `day-${day}` },
      update: {},
      create: {
        id: `day-${day}`,
        dayOfWeek: day,
        openTime: '09:00',
        closeTime: '17:00',
        isOpen: day !== 0 // Closed on Sundays
      }
    });
  }

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
