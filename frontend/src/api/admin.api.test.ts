import { describe, it, expect, afterEach, vi } from 'vitest'
import { registerAdmin } from './admin.api'
import { mockFetchOnce, firstCall } from '../tests/mockFetch'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('registerAdmin', () => {
  it('POSTs to /admin/register with the x-admin-secret header', async () => {
    const fetchMock = mockFetchOnce(
      { id: 'a1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
      { status: 201 },
    )

    const result = await registerAdmin(
      { name: 'Admin', email: 'admin@example.com', password: 'Secret123!' },
      'the-admin-secret',
    )

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/admin/register')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['x-admin-secret']).toBe(
      'the-admin-secret',
    )
    expect(result.role).toBe('ADMIN')
  })
})
