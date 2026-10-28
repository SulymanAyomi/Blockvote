// src/workers/db.ts
// Workers use their own Prisma client so they never import Next.js-only code.
// Mirror the setup in your existing src/lib/prisma.ts, but read only DATABASE_URL.
// The example below is the Prisma 7 driver-adapter form (npm i @prisma/adapter-pg).
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export const errInfo = (e: unknown) => e instanceof Error ? `${e.name} ${(e as any).code ?? ""}`.trim() : "unknown"

export default prisma;
