import { z } from 'zod'

const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000/api'

const TOKEN_KEY = 'accessToken'

/** The backend wraps every response in this envelope. */
const envelopeSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.unknown(),
})

/** Error carrying the backend's status code and human-readable message. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token === null) {
    localStorage.removeItem(TOKEN_KEY)
  } else {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

/**
 * Calls the backend, unwraps the response envelope, and validates the data
 * against the given zod schema so the rest of the app only ever sees
 * correctly-typed values.
 */
export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { ...options.headers }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    ...(options.body !== undefined && { body: JSON.stringify(options.body) }),
  })

  const envelope = envelopeSchema.parse(await res.json())
  if (!res.ok) {
    throw new ApiError(res.status, envelope.message)
  }

  return schema.parse(envelope.data)
}
