import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
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

function renderNavbar(user: User) {
  setToken('jwt')
  localStorage.setItem('authUser', JSON.stringify(user))
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Navbar />} />
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Navbar', () => {
  it("shows the brand and the user's name", () => {
    renderNavbar(customer)

    expect(screen.getByText(/car dealership/i)).toBeInTheDocument()
    expect(screen.getByText('Krish')).toBeInTheDocument()
  })

  it('links to the purchases page', () => {
    renderNavbar(customer)

    expect(
      screen.getByRole('link', { name: /my purchases/i }),
    ).toBeInTheDocument()
  })

  it('hides the admin link from customers', () => {
    renderNavbar(customer)

    expect(
      screen.queryByRole('link', { name: /admin/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the admin link to admins', () => {
    renderNavbar({ ...customer, role: 'ADMIN' })

    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument()
  })

  it('logs out and returns to the login page', async () => {
    renderNavbar(customer)

    await userEvent.click(screen.getByRole('button', { name: /log ?out/i }))

    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument()
    expect(localStorage.getItem('authUser')).toBeNull()
  })
})
