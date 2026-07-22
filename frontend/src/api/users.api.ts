import { z } from 'zod'
import { request } from './client'
import { userSchema, purchaseHistoryEntrySchema } from './schemas'
import type { User, PurchaseHistoryEntry } from './schemas'

/** GET /api/users/me */
export function getMe(): Promise<User> {
  return request('/users/me', userSchema)
}

/** GET /api/users/me/purchases — newest first, vehicle null if deleted. */
export function getMyPurchases(): Promise<PurchaseHistoryEntry[]> {
  return request('/users/me/purchases', z.array(purchaseHistoryEntrySchema))
}
