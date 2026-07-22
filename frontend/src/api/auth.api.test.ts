import { describe, it, expect, afterEach, vi } from 'vitest'
import { registerUser, loginUser } from './auth.api'
import { mockFetchOnce, firstCall } from '../tests/mockFetch'

const user = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('registerUser', () => {
  it('POSTs the registration payload to /auth/register', async () => {
    const fetchMock = mockFetchOnce(user, { status: 201 })

    const result = await registerUser({
      name: 'Krish',
      email: 'krish@example.com',
      password: 'Password123!',
    })

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/auth/register')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toMatchObject({
      email: 'krish@example.com',
    })
    expect(result).toMatchObject({ id: 'u1', role: 'CUSTOMER' })
  })
})

describe('loginUser', () => {
  it('POSTs credentials to /auth/login and returns token plus user', async () => {
    const fetchMock = mockFetchOnce({ accessToken: 'jwt-token', user })

    const result = await loginUser({
      email: 'krish@example.com',
      password: 'Password123!',
    })

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/auth/login')
    expect(init.method).toBe('POST')
    expect(result.accessToken).toBe('jwt-token')
    expect(result.user.email).toBe('krish@example.com')
  })
})
