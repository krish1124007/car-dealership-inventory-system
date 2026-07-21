// Model definitions live in prisma/schema.prisma; Prisma generates the
// types and query delegates from it. This module re-exports the user-related
// pieces so app code doesn't import from the generated folder directly.
export type { User, Purchase } from "../generated/prisma/client.js";
export { Role } from "../generated/prisma/client.js";
