import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createClient() {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.set("connection_limit", "5");
  url.searchParams.set("pool_timeout", "20");
  const adapter = new PrismaPg(url.toString());
  return new PrismaClient({ adapter });
}

type DbClient = ReturnType<typeof createClient>;
const globalForPrisma = globalThis as unknown as { prisma: DbClient };
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
