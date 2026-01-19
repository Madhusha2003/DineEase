import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Seeding database with users...');

    // Define users to create
    const usersToCreate = [
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'ADMIN',
        isActive: true,
      },
      {
        name: 'John Waiter',
        email: 'user@gmail.com',
        password: 'waiter123',
        role: 'WAITER',
        isActive: true,
      },
      {
        name: 'Chef Maria',
        email: 'chef@gmail.com',
        password: 'chef123',
        role: 'KITCHENSTAFF',
        isActive: true,
      },
    ];

    // Create each user
    for (const userData of usersToCreate) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`✓ User ${userData.email} already exists`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          isActive: userData.isActive,
        },
      });

      console.log(`✓ Created ${userData.role}: ${user.email}`);
    }

    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
