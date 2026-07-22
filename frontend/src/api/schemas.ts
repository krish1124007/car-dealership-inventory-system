import { z } from 'zod'

export const roleSchema = z.enum(['CUSTOMER', 'ADMIN'])

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: roleSchema,
})

export const vehicleSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  category: z.string(),
  price: z.number(),
  quantity: z.number(),
})

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
})

export const purchaseSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  purchasePrice: z.number(),
  purchasedAt: z.string(),
})

export const purchaseResultSchema = z.object({
  vehicle: vehicleSchema,
  purchase: purchaseSchema,
})

/** History entry; vehicle is null when the listing was deleted later. */
export const purchaseHistoryEntrySchema = purchaseSchema.extend({
  vehicle: vehicleSchema.nullable(),
})

export type Role = z.infer<typeof roleSchema>
export type User = z.infer<typeof userSchema>
export type Vehicle = z.infer<typeof vehicleSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type Purchase = z.infer<typeof purchaseSchema>
export type PurchaseResult = z.infer<typeof purchaseResultSchema>
export type PurchaseHistoryEntry = z.infer<typeof purchaseHistoryEntrySchema>
