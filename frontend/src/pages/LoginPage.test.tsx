import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { LoginPage } from './LoginPage'
import * as authApi from '../api/auth.api'
import { ApiError } from '../api/client'
import type { User } from '../api/schemas'

vi.mock('../api/auth.api')

const customer: User = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>DASHBOARD</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders email and password fields with a submit button', () => {
    renderLogin()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument()
  })

  it('logs in with the entered credentials and navigates to the dashboard', async () => {
    vi.mocked(authApi.loginUser).mockResolvedValue({
      accessToken: 'jwt',
      user: customer,
    })
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email/i), 'krish@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123!')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(authApi.loginUser).toHaveBeenCalledWith({
      email: 'krish@example.com',
      password: 'Password123!',
    })
    expect(await screen.findByText('DASHBOARD')).toBeInTheDocument()
  })

  it('shows the server error message when login fails', async () => {
    vi.mocked(authApi.loginUser).mockRejectedValue(
      new ApiError(401, 'Invalid email or password'),
    )
    renderLogin()

    await userEvent.type(screen.getByLabelText(/email/i), 'krish@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByText(/invalid email or password/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument()
  })

  it('logs straight in as the demo admin with one click, no typing', async () => {
    const admin: User = {
      id: 'a1',
      name: 'Test Admin',
      email: 'admin@cardealership.com',
      role: 'ADMIN',
    }
    vi.mocked(authApi.loginUser).mockResolvedValue({
      accessToken: 'jwt',
      user: admin,
    })
    renderLogin()

    await userEvent.click(
      screen.getByRole('button', { name: /log in as demo admin/i }),
    )

    expect(authApi.loginUser).toHaveBeenCalledWith({
      email: 'admin@cardealership.com',
      password: 'Admin@123',
    })
    expect(await screen.findByText('DASHBOARD')).toBeInTheDocument()
  })

  it('fills the visible fields so the demo credentials are not a mystery', async () => {
    vi.mocked(authApi.loginUser).mockRejectedValue(
      new ApiError(401, 'Invalid email or password'),
    )
    renderLogin()

    await userEvent.click(
      screen.getByRole('button', { name: /log in as demo admin/i }),
    )

    expect(screen.getByLabelText(/email/i)).toHaveValue(
      'admin@cardealership.com',
    )
  })

  it('links to the register page', () => {
    renderLogin()

    expect(
      screen.getByRole('link', { name: /create.*account|register/i }),
    ).toBeInTheDocument()
  })
})
