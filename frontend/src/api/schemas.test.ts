import { describe, it, expect } from 'vitest'
import {
  userSchema,
  vehicleSchema,
  loginResponseSchema,
  purchaseHistoryEntrySchema,
  purchaseResultSchema,
} from './schemas'

const validUser = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

const validVehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 20000,
  quantity: 5,
}

describe('userSchema', () => {
  it('accepts a valid user', () => {
    expect(userSchema.parse(validUser)).toMatchObject(validUser)
  })

  it('rejects an unknown role', () => {
    expect(
      userSchema.safeParse({ ...validUser, role: 'SUPERADMIN' }).success,
    ).toBe(false)
  })
})

describe('vehicleSchema', () => {
  it('accepts a valid vehicle', () => {
    expect(vehicleSchema.parse(validVehicle)).toMatchObject(validVehicle)
  })

  it('rejects a non-numeric price', () => {
    expect(
      vehicleSchema.safeParse({ ...validVehicle, price: 'expensive' }).success,
    ).toBe(false)
  })
})

describe('loginResponseSchema', () => {
  it('requires both the access token and the user', () => {
    expect(
      loginResponseSchema.parse({ accessToken: 'jwt', user: validUser }),
    ).toMatchObject({ accessToken: 'jwt' })
    expect(loginResponseSchema.safeParse({ accessToken: 'jwt' }).success).toBe(
      false,
    )
  })
})

describe('purchaseResultSchema', () => {
  it('accepts the vehicle plus purchase payload', () => {
    const result = purchaseResultSchema.parse({
      vehicle: validVehicle,
      purchase: {
        id: 'p1',
        quantity: 1,
        purchasePrice: 20000,
        purchasedAt: '2026-07-22T10:00:00.000Z',
      },
    })
    expect(result.purchase.purchasePrice).toBe(20000)
  })
})

describe('purchaseHistoryEntrySchema', () => {
  it('accepts an entry with vehicle details', () => {
    const entry = purchaseHistoryEntrySchema.parse({
      id: 'p1',
      quantity: 1,
      purchasePrice: 20000,
      purchasedAt: '2026-07-22T10:00:00.000Z',
      vehicle: validVehicle,
    })
    expect(entry.vehicle?.make).toBe('Toyota')
  })

  it('accepts a null vehicle for deleted listings', () => {
    const entry = purchaseHistoryEntrySchema.parse({
      id: 'p1',
      quantity: 1,
      purchasePrice: 20000,
      purchasedAt: '2026-07-22T10:00:00.000Z',
      vehicle: null,
    })
    expect(entry.vehicle).toBeNull()
  })
})
