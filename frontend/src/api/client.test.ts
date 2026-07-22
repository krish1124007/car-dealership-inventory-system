import { describe, it, expect, afterEach, vi } from 'vitest'
import { z } from 'zod'
import { request, ApiError, getToken, setToken } from './client'
import { mockFetchOnce, firstCall } from '../tests/mockFetch'

const anySchema = z.unknown()

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('token storage', () => {
  it('stores and returns the access token', () => {
    setToken('jwt-token')
    expect(getToken()).toBe('jwt-token')
  })

  it('clears the token when set to null', () => {
    setToken('jwt-token')
    setToken(null)
    expect(getToken()).toBeNull()
  })
})

describe('request', () => {
  it('calls the API base url with the given path', async () => {
    const fetchMock = mockFetchOnce({ ok: true })

    await request('/vehicles', anySchema)

    const [url] = firstCall(fetchMock)
    expect(url).toContain('/api/vehicles')
  })

  it('sends no Authorization header when there is no token', async () => {
    const fetchMock = mockFetchOnce(null)

    await request('/auth/login', anySchema, { method: 'POST', body: {} })

    const [, init] = firstCall(fetchMock)
    expect(
      (init.headers as Record<string, string>)['Authorization'],
    ).toBeUndefined()
  })

  it('attaches the Bearer token when one is stored', async () => {
    setToken('jwt-token')
    const fetchMock = mockFetchOnce([])

    await request('/vehicles', anySchema)

    const [, init] = firstCall(fetchMock)
    expect((init.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer jwt-token',
    )
  })

  it('serializes the body as JSON with the right content type', async () => {
    const fetchMock = mockFetchOnce(null)

    await request('/auth/register', anySchema, {
      method: 'POST',
      body: { name: 'Krish' },
    })

    const [, init] = firstCall(fetchMock)
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ name: 'Krish' }))
    expect((init.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    )
  })

  it('unwraps the response envelope and returns the parsed data', async () => {
    mockFetchOnce({ id: 'v1' })

    const result = await request('/vehicles', z.object({ id: z.string() }))

    expect(result).toEqual({ id: 'v1' })
  })

  it('throws ApiError carrying the server message and status on failure', async () => {
    mockFetchOnce(null, { status: 401, message: 'Authentication required' })

    const promise = request('/vehicles', anySchema)

    await expect(promise).rejects.toBeInstanceOf(ApiError)
    await expect(
      request('/vehicles', anySchema),
    ).rejects.toMatchObject({ status: 401, message: 'Authentication required' })
  })

  it('rejects when the response data does not match the schema', async () => {
    mockFetchOnce({ id: 123 })

    await expect(
      request('/vehicles', z.object({ id: z.string() })),
    ).rejects.toThrow()
  })
})
