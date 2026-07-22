import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import * as authApi from '../api/auth.api'
import { getToken, setToken } from '../api/client'
import type { User } from '../api/schemas'

vi.mock('../api/auth.api')

const customer: User = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

const admin: User = { ...customer, id: 'a1', role: 'ADMIN' }

function Probe() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="user">{auth.user?.email ?? 'none'}</span>
      <span data-testid="is-admin">{String(auth.isAdmin)}</span>
      <button onClick={() => void auth.login('krish@example.com', 'pw')}>
        do-login
      </button>
      <button
        onClick={() => void auth.register('Krish', 'krish@example.com', 'pw')}
      >
        do-register
      </button>
      <button onClick={() => auth.logout()}>do-logout</button>
    </div>
  )
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthContext', () => {
  it('starts logged out when storage is empty', () => {
    renderProbe()

    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false')
  })

  it('restores the session from storage', () => {
    setToken('stored-jwt')
    localStorage.setItem('authUser', JSON.stringify(customer))

    renderProbe()

    expect(screen.getByTestId('user')).toHaveTextContent('krish@example.com')
  })

  it('login stores the token and the user', async () => {
    vi.mocked(authApi.loginUser).mockResolvedValue({
      accessToken: 'fresh-jwt',
      user: customer,
    })
    renderProbe()

    await userEvent.click(screen.getByText('do-login'))

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent(
        'krish@example.com',
      ),
    )
    expect(getToken()).toBe('fresh-jwt')
    expect(JSON.parse(localStorage.getItem('authUser')!)).toMatchObject({
      email: 'krish@example.com',
    })
  })

  it('register creates the account and then logs in', async () => {
    vi.mocked(authApi.registerUser).mockResolvedValue(customer)
    vi.mocked(authApi.loginUser).mockResolvedValue({
      accessToken: 'fresh-jwt',
      user: customer,
    })
    renderProbe()

    await userEvent.click(screen.getByText('do-register'))

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent(
        'krish@example.com',
      ),
    )
    expect(authApi.registerUser).toHaveBeenCalledWith({
      name: 'Krish',
      email: 'krish@example.com',
      password: 'pw',
    })
    expect(getToken()).toBe('fresh-jwt')
  })

  it('logout clears the session', async () => {
    setToken('stored-jwt')
    localStorage.setItem('authUser', JSON.stringify(customer))
    renderProbe()

    await userEvent.click(screen.getByText('do-logout'))

    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(getToken()).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()
  })

  it('exposes isAdmin for admin users', () => {
    setToken('stored-jwt')
    localStorage.setItem('authUser', JSON.stringify(admin))

    renderProbe()

    expect(screen.getByTestId('is-admin')).toHaveTextContent('true')
  })
})
