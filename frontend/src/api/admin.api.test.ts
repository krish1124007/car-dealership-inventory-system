import { describe, it, expect, afterEach, vi } from 'vitest'
import * as adminApi from './admin.api'
import { mockFetchOnce, firstCall } from '../tests/mockFetch'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('listUsers', () => {
  it('GETs /admin/users and returns the parsed list', async () => {
    const fetchMock = mockFetchOnce({
      total: 2,
      users: [
        {
          id: 'a1',
          name: 'Test Admin',
          email: 'admin@cardealership.com',
          role: 'ADMIN',
          createdAt: '2026-07-20T09:00:00.000Z',
          lastLoginAt: '2026-07-23T11:31:00.000Z',
        },
        {
          id: 'u1',
          name: 'Demo Customer',
          email: 'user@cardealership.com',
          role: 'CUSTOMER',
          createdAt: '2026-07-21T09:00:00.000Z',
        },
      ],
    })

    const result = await adminApi.listUsers()

    const [url] = firstCall(fetchMock)
    expect(url).toMatch(/\/admin\/users$/)
    expect(result.total).toBe(2)
    expect(result.users[1]?.lastLoginAt).toBeUndefined()
  })

  it('no longer exposes any way to register an admin', () => {
    expect(
      (adminApi as Record<string, unknown>)['registerAdmin'],
    ).toBeUndefined()
  })
})
