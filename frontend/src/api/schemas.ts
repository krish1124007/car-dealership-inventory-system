import { z } from 'zod'

export const roleSchema = z.enum(['CUSTOMER', 'ADMIN'])

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: roleSchema,
})

export const fuelTypeSchema = z.enum(['PETROL', 'DIESEL', 'ELECTRIC'])

export const vehicleSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  category: z.string(),
  // Optional so listings created before these fields existed still parse.
  fuelType: fuelTypeSchema.optional(),
  preLaunch: z.boolean().optional(),
  price: z.number(),
  quantity: z.number(),
  imageUrl: z.string().optional(),
  // Extra gallery photos (interior, seats, details) beyond the main one.
  images: z.array(z.string()).optional(),
})

/** A user as the admin panel sees them, with sign-in history. */
export const adminUserSchema = userSchema.extend({
  createdAt: z.string().optional(),
  /** Absent until the user has signed in at least once. */
  lastLoginAt: z.string().optional(),
})

export const adminUserListSchema = z.object({
  total: z.number(),
  users: z.array(adminUserSchema),
})

export const contactMessageSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  subject: z.string().optional(),
  message: z.string(),
  createdAt: z.string(),
})

export const contactMessageListSchema = z.object({
  total: z.number(),
  messages: z.array(contactMessageSchema),
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
export type FuelType = z.infer<typeof fuelTypeSchema>
export type User = z.infer<typeof userSchema>
export type AdminUser = z.infer<typeof adminUserSchema>
export type AdminUserList = z.infer<typeof adminUserListSchema>
export type ContactMessage = z.infer<typeof contactMessageSchema>
export type ContactMessageList = z.infer<typeof contactMessageListSchema>
export type Vehicle = z.infer<typeof vehicleSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type Purchase = z.infer<typeof purchaseSchema>
export type PurchaseResult = z.infer<typeof purchaseResultSchema>
export type PurchaseHistoryEntry = z.infer<typeof purchaseHistoryEntrySchema>
