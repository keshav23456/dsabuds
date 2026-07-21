import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
  try {
    return new PrismaClient({ log: ["error"] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (
      err instanceof Error &&
      err.name === "PrismaClientConstructorValidationError" &&
      msg.includes('engine type "client"')
    ) {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const { Pool } = await import("pg");

      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error(
          "DATABASE_URL is required to initialize Prisma with @prisma/adapter-pg"
        );
      }

      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter, log: ["error"] });
    }
    throw err;
  }
}

export const prisma = globalForPrisma.prisma ?? (await createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
