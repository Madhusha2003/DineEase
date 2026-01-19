import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });
    
    if (user) {
      console.log('User found:');
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- Role:', user.role);
      console.log('- Is Active:', user.isActive);
    } else {
      console.log('User not found with email: admin@gmail.com');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
