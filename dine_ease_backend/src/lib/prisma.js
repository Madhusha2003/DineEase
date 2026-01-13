import { PrismaClient } from '@prisma/client';

// This pattern prevents creating new PrismaClient instances during hot-reloading
// in development, which can exhaust database connections.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;