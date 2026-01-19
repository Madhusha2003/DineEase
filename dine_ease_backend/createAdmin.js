import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✓ Admin user created successfully!');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
    console.log('\nYou can now login with:');
    console.log('Email: admin@gmail.com');
    console.log('Password: 123456');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✗ User already exists with this email');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
