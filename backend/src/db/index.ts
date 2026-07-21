import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Prisma 7 requires a driver adapter; PrismaPg speaks direct TCP to Postgres,
// so DATABASE_URL must be a plain postgres:// connection string.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    process.exit(1);
  }
}

async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma, connectDB, disconnectDB };
