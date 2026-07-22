import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { AdminRegisterPage } from './AdminRegisterPage'
import * as adminApi from '../api/admin.api'
import * as authApi from '../api/auth.api'
import { ApiError } from '../api/client'
import type { User } from '../api/schemas'

vi.mock('../api/admin.api')
vi.mock('../api/auth.api')

const admin: User = {
  id: 'a1',
  name: 'Site Admin',
  email: 'admin@example.com',
  role: 'ADMIN',
}

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin/register']}>
        <Routes>
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route path="/admin" element={<div>ADMIN PANEL</div>} />
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText(/name/i), 'Site Admin')
  await userEvent.type(screen.getByLabelText(/email/i), 'admin@example.com')
  await userEvent.type(screen.getByLabelText(/^password$/i), 'AdminPass123!')
  await userEvent.type(screen.getByLabelText(/admin secret/i), 'the-secret')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminRegisterPage', () => {
  it('renders name, email, password and admin secret fields', () => {
    renderPage()

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/admin secret/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create admin account/i }),
    ).toBeInTheDocument()
  })

  it('registers the admin with the secret, logs in and opens the admin panel', async () => {
    vi.mocked(adminApi.registerAdmin).mockResolvedValue(admin)
    vi.mocked(authApi.loginUser).mockResolvedValue({
      accessToken: 'jwt',
      user: admin,
    })
    renderPage()

    await fillForm()
    await userEvent.click(
      screen.getByRole('button', { name: /create admin account/i }),
    )

    expect(adminApi.registerAdmin).toHaveBeenCalledWith(
      {
        name: 'Site Admin',
        email: 'admin@example.com',
        password: 'AdminPass123!',
      },
      'the-secret',
    )
    expect(authApi.loginUser).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'AdminPass123!',
    })
    expect(await screen.findByText('ADMIN PANEL')).toBeInTheDocument()
  })

  it('shows the server error when the secret is wrong', async () => {
    vi.mocked(adminApi.registerAdmin).mockRejectedValue(
      new ApiError(403, 'Invalid admin registration secret'),
    )
    renderPage()

    await fillForm()
    await userEvent.click(
      screen.getByRole('button', { name: /create admin account/i }),
    )

    expect(
      await screen.findByText(/invalid admin registration secret/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('ADMIN PANEL')).not.toBeInTheDocument()
  })

  it('links back to the sign in page', () => {
    renderPage()

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })
})
