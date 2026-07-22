import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { loginUser, registerUser } from '../api/auth.api'
import { setToken } from '../api/client'
import type { User } from '../api/schemas'

const USER_KEY = 'authUser'

interface AuthContextValue {
  user: User | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)

  async function login(email: string, password: string): Promise<void> {
    const result = await loginUser({ email, password })
    setToken(result.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
    setUser(result.user)
  }

  async function register(
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    await registerUser({ name, email, password })
    await login(email, password)
  }

  function logout(): void {
    setToken(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAdmin: user?.role === 'ADMIN', login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return ctx
}
