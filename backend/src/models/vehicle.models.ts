// Model definitions live in prisma/schema.prisma; Prisma generates the
// types and query delegates from it. This module re-exports the vehicle
// model type so app code doesn't import from the generated folder directly.
export type { Vehicle } from "../generated/prisma/client.js";
