/**
 * The demo admin the backend auto-creates on start (see
 * `backend/src/utils/ensureAdmin.ts`). Kept in one place so the one-click
 * login and the credentials panel can never drift apart.
 *
 * A deployment that changes DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD
 * should set the matching VITE_ variables; setting either to an empty
 * string hides the one-click login entirely.
 */
const email =
  (import.meta.env.VITE_DEMO_ADMIN_EMAIL as string | undefined) ??
  'admin@cardealership.com'

const password =
  (import.meta.env.VITE_DEMO_ADMIN_PASSWORD as string | undefined) ??
  'Admin@123'

export const DEMO_ADMIN = { email, password }

/** False when a deployment has deliberately blanked the demo credentials. */
export const demoLoginEnabled = Boolean(email && password)
