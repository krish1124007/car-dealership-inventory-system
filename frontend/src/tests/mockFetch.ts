import { vi } from 'vitest'

/**
 * Replaces global fetch with a mock that resolves to the backend's
 * { statusCode, message, data } response envelope. Returns the mock so
 * tests can inspect the url/init it was called with.
 */
export function mockFetchOnce(
  data: unknown,
  opts: { status?: number; message?: string } = {},
) {
  const status = opts.status ?? 200
  const body = { statusCode: status, message: opts.message ?? 'ok', data }
  const fn = vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

/** The [url, init] pair of the mock's first call. */
export function firstCall(fn: ReturnType<typeof vi.fn>): [string, RequestInit] {
  const call = fn.mock.calls[0] as [string, RequestInit]
  return call
}
