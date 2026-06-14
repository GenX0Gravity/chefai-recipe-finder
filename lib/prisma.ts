import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// During next build, route files are evaluated server-side.
// We must guard PrismaClient instantiation so it doesn't crash without a DATABASE_URL.
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost/dummy';
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
