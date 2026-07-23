import { request } from './client'
import { adminUserListSchema } from './schemas'
import type { AdminUserList } from './schemas'

/**
 * GET /api/admin/users (admin) — everyone registered, with sign-in history.
 *
 * There is deliberately no admin-registration call: admin accounts exist
 * only because the server creates them on start.
 */
export function listUsers(): Promise<AdminUserList> {
  return request('/admin/users', adminUserListSchema)
}
