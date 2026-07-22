import { z } from 'zod'
import { API_BASE, ApiError, getToken } from './client'

const uploadResponseSchema = z.object({ url: z.string() })

const envelopeSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.unknown(),
})

/**
 * POST /api/uploads/vehicle-image (admin) — multipart upload; the backend
 * stores the file under its public folder and returns the public url.
 */
export async function uploadVehicleImage(
  file: File,
): Promise<{ url: string }> {
  const body = new FormData()
  body.append('image', file)

  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}/uploads/vehicle-image`, {
    method: 'POST',
    headers,
    body,
  })

  const envelope = envelopeSchema.parse(await res.json())
  if (!res.ok) {
    throw new ApiError(res.status, envelope.message)
  }
  return uploadResponseSchema.parse(envelope.data)
}
