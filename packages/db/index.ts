import { PrismaClient } from '@prisma/client';

declare global { var __orbitPrisma: PrismaClient | undefined }
export const db = global.__orbitPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__orbitPrisma = db;
