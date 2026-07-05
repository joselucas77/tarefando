import { PrismaClient } from "@/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const context = getRequestContext();
  const d1Binding = context.env.DB;
  const adapter = new PrismaD1(d1Binding);

  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

  return prisma;
}
