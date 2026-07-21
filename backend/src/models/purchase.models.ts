// Model definitions live in prisma/schema.prisma; Prisma generates the
// types and query delegates from it. This module re-exports the purchase
// model type so app code doesn't import from the generated folder directly.
export type { Purchase } from "../generated/prisma/client.js";
