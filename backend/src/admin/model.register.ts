import { prisma } from "../db/index.js";

// Registry of Prisma model delegates, keyed by model name.
export const models = {
  user: prisma.user,
  vehicle: prisma.vehicle,
  purchase: prisma.purchase,
};
