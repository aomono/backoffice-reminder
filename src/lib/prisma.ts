import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    // Prisma v7 requires adapter configuration via prisma.config.ts
    // The PrismaClient constructor picks up the datasource from there at runtime
    globalForPrisma.prisma = new (PrismaClient as unknown as new () => PrismaClient)();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrismaClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
