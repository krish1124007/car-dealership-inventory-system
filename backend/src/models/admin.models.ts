// There is no separate Admin collection — an admin is a User whose role is
// ADMIN (see user.models.ts). This alias exists for readability at call sites.
export { User as Admin } from "./user.models.js";
