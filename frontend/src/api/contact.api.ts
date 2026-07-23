import { z } from 'zod'
import { request } from './client'
import { contactMessageListSchema } from './schemas'
import type { ContactMessageList } from './schemas'

export interface ContactPayload {
  name: string
  email: string
  subject?: string
  message: string
}

/** POST /api/contact — open to visitors, no account required. */
export function sendContactMessage(payload: ContactPayload): Promise<null> {
  return request('/contact', z.null(), { method: 'POST', body: payload })
}

/** GET /api/contact (admin) — the inbox, newest first. */
export function listContactMessages(): Promise<ContactMessageList> {
  return request('/contact', contactMessageListSchema)
}
