import { request } from './client'
import { userSchema, loginResponseSchema } from './schemas'
import type { User, LoginResponse } from './schemas'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

/** POST /api/auth/register — always creates a CUSTOMER account. */
export function registerUser(payload: RegisterPayload): Promise<User> {
  return request('/auth/register', userSchema, {
    method: 'POST',
    body: payload,
  })
}

/** POST /api/auth/login — returns the JWT and the user's profile. */
export function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return request('/auth/login', loginResponseSchema, {
    method: 'POST',
    body: payload,
  })
}
