import { describe, it, expect, afterEach, vi } from 'vitest'
import { getMe, getMyPurchases } from './users.api'
import { mockFetchOnce, firstCall } from '../tests/mockFetch'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getMe', () => {
  it('GETs /users/me and returns the profile', async () => {
    const fetchMock = mockFetchOnce({
      id: 'u1',
      name: 'Krish',
      email: 'krish@example.com',
      role: 'CUSTOMER',
    })

    const result = await getMe()

    const [url] = firstCall(fetchMock)
    expect(url).toContain('/users/me')
    expect(result.email).toBe('krish@example.com')
  })
})

describe('getMyPurchases', () => {
  it('GETs /users/me/purchases and returns the history', async () => {
    const fetchMock = mockFetchOnce([
      {
        id: 'p1',
        quantity: 1,
        purchasePrice: 45000,
        purchasedAt: '2026-07-22T10:00:00.000Z',
        vehicle: null,
      },
    ])

    const result = await getMyPurchases()

    const [url] = firstCall(fetchMock)
    expect(url).toContain('/users/me/purchases')
    expect(result).toHaveLength(1)
    expect(result[0].purchasePrice).toBe(45000)
  })
})
