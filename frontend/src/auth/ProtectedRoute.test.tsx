import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import { setToken } from '../api/client'
import type { User } from '../api/schemas'

const customer: User = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

function renderAt(path: string, adminOnly = false) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
          <Route path="/" element={<div>HOME PAGE</div>} />
          <Route
            path="/secret"
            element={
              <ProtectedRoute adminOnly={adminOnly}>
                <div>SECRET PAGE</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

function storeSession(user: User) {
  setToken('jwt')
  localStorage.setItem('authUser', JSON.stringify(user))
}

describe('ProtectedRoute', () => {
  it('redirects logged-out visitors to /login', () => {
    renderAt('/secret')

    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument()
    expect(screen.queryByText('SECRET PAGE')).not.toBeInTheDocument()
  })

  it('renders the protected content for a logged-in user', () => {
    storeSession(customer)

    renderAt('/secret')

    expect(screen.getByText('SECRET PAGE')).toBeInTheDocument()
  })

  it('sends non-admins to the home page when adminOnly is set', () => {
    storeSession(customer)

    renderAt('/secret', true)

    expect(screen.getByText('HOME PAGE')).toBeInTheDocument()
    expect(screen.queryByText('SECRET PAGE')).not.toBeInTheDocument()
  })

  it('lets admins through adminOnly routes', () => {
    storeSession({ ...customer, role: 'ADMIN' })

    renderAt('/secret', true)

    expect(screen.getByText('SECRET PAGE')).toBeInTheDocument()
  })
})
