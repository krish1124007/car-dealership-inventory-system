/**
 * The demo accounts the backend creates on start (see
 * `backend/src/utils/ensureDemoAccounts.ts`). Kept in one place so the
 * one-click sign-in buttons can never drift from what the server made.
 *
 * A deployment that changes DEFAULT_ADMIN_* / DEFAULT_USER_* should set the
 * matching VITE_ variables; blanking either pair hides that button.
 */
function fromEnv(key: string, fallback: string): string {
  const value = import.meta.env[key] as string | undefined
  return value ?? fallback
}

export const DEMO_ADMIN = {
  email: fromEnv('VITE_DEMO_ADMIN_EMAIL', 'admin@cardealership.com'),
  password: fromEnv('VITE_DEMO_ADMIN_PASSWORD', 'Admin@123'),
}

export const DEMO_USER = {
  email: fromEnv('VITE_DEMO_USER_EMAIL', 'user@cardealership.com'),
  password: fromEnv('VITE_DEMO_USER_PASSWORD', 'User@123'),
}

export const demoAdminEnabled = Boolean(DEMO_ADMIN.email && DEMO_ADMIN.password)
export const demoUserEnabled = Boolean(DEMO_USER.email && DEMO_USER.password)
