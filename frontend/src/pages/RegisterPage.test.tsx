import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { RegisterPage } from './RegisterPage'
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

function renderRegister() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<div>DASHBOARD</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText(/name/i), 'Krish')
  await userEvent.type(screen.getByLabelText(/email/i), 'krish@example.com')
  await userEvent.type(screen.getByLabelText(/password/i), 'Password123!')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RegisterPage', () => {
  it('renders name, email and password fields with a submit button', () => {
    renderRegister()

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()
  })

  it('registers, auto-logs-in and navigates to the dashboard', async () => {
    vi.mocked(authApi.registerUser).mockResolvedValue(customer)
    vi.mocked(authApi.loginUser).mockResolvedValue({
      accessToken: 'jwt',
      user: customer,
    })
    renderRegister()

    await fillForm()
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i }),
    )

    expect(authApi.registerUser).toHaveBeenCalledWith({
      name: 'Krish',
      email: 'krish@example.com',
      password: 'Password123!',
    })
    expect(await screen.findByText('DASHBOARD')).toBeInTheDocument()
  })

  it('shows the server error message when the email is taken', async () => {
    vi.mocked(authApi.registerUser).mockRejectedValue(
      new ApiError(409, 'Email is already registered'),
    )
    renderRegister()

    await fillForm()
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i }),
    )

    expect(
      await screen.findByText(/email is already registered/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument()
  })

  it('links to the login page', () => {
    renderRegister()

    expect(
      screen.getByRole('link', { name: /sign in/i }),
    ).toBeInTheDocument()
  })
})
