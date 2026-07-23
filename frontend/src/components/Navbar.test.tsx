import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { Navbar } from './Navbar'
import { setToken } from '../api/client'
import type { User } from '../api/schemas'

const customer: User = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

function CarsProbe() {
  const location = useLocation()
  return <div>CARS PAGE {location.search}</div>
}

function renderNavbar(user?: User) {
  if (user) {
    setToken('jwt')
    localStorage.setItem('authUser', JSON.stringify(user))
  }
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Navbar />} />
          <Route path="/cars" element={<CarsProbe />} />
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Navbar', () => {
  it('shows the brand and a Cars link', () => {
    renderNavbar()

    expect(screen.getByText(/car dealership/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^cars$/i })).toHaveAttribute(
      'href',
      '/cars',
    )
  })

  it('search submits to the cars page with the query', async () => {
    renderNavbar()

    await userEvent.type(screen.getByRole('searchbox'), 'Corolla{enter}')

    expect(await screen.findByText(/cars page/i)).toBeInTheDocument()
    expect(screen.getByText(/q=Corolla/)).toBeInTheDocument()
  })

  it('shows a Login link when logged out', () => {
    renderNavbar()

    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.queryByRole('button', { name: /account/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the account menu instead of Login when logged in', async () => {
    renderNavbar(customer)

    expect(
      screen.queryByRole('link', { name: /login/i }),
    ).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /account/i }))

    expect(screen.getByText('Krish')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /my purchases/i }),
    ).toBeInTheDocument()
  })

  it('hides the admin item from customers', async () => {
    renderNavbar(customer)

    await userEvent.click(screen.getByRole('button', { name: /account/i }))

    expect(
      screen.queryByRole('link', { name: /admin/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the admin item to admins', async () => {
    renderNavbar({ ...customer, role: 'ADMIN' })

    await userEvent.click(screen.getByRole('button', { name: /account/i }))

    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()
  })

  it('logs out from the account menu', async () => {
    renderNavbar(customer)

    await userEvent.click(screen.getByRole('button', { name: /account/i }))
    await userEvent.click(screen.getByRole('button', { name: /log ?out/i }))

    expect(localStorage.getItem('authUser')).toBeNull()
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  })
})
