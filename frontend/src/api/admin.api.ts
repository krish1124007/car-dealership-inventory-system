import { request } from './client'
import { userSchema, adminUserListSchema } from './schemas'
import type { User, AdminUserList } from './schemas'
import type { RegisterPayload } from './auth.api'

/**
 * POST /api/admin/register — creates an ADMIN account. Requires the shared
 * registration secret, sent as the x-admin-secret header.
 */
export function registerAdmin(
  payload: RegisterPayload,
  adminSecret: string,
): Promise<User> {
  return request('/admin/register', userSchema, {
    method: 'POST',
    body: payload,
    headers: { 'x-admin-secret': adminSecret },
  })
}

/** GET /api/admin/users (admin) — everyone registered, with sign-in history. */
export function listUsers(): Promise<AdminUserList> {
  return request('/admin/users', adminUserListSchema)
}
