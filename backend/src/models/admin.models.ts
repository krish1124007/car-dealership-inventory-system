// There is no separate Admin table — an admin is a User whose role is ADMIN
// (see prisma/schema.prisma). This alias exists for readability at call sites.
export type { User as Admin } from "../generated/prisma/client.js";
