import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { VehicleCard } from './VehicleCard'
import { setToken } from '../api/client'
import type { User, Vehicle } from '../api/schemas'

const vehicle: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 20000,
  quantity: 3,
}

const customer: User = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

function renderCard(v: Vehicle = vehicle, { signedIn = true } = {}) {
  if (signedIn) {
    setToken('jwt')
    localStorage.setItem('authUser', JSON.stringify(customer))
  }
  return render(
    <AuthProvider>
      <MemoryRouter>
        <VehicleCard vehicle={v} />
      </MemoryRouter>
    </AuthProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  setToken(null)
})

describe('VehicleCard', () => {
  it('shows the vehicle details', () => {
    renderCard()

    expect(screen.getByText(/toyota/i)).toBeInTheDocument()
    expect(screen.getByText(/corolla/i)).toBeInTheDocument()
    expect(screen.getByText(/sedan/i)).toBeInTheDocument()
    expect(screen.getByText('₹20,000')).toBeInTheDocument()
    expect(screen.getByText(/3 in stock/i)).toBeInTheDocument()
  })

  it('links a signed-in visitor straight to the vehicle detail page', () => {
    renderCard()

    const link = screen.getByRole('link', { name: /view car/i })
    expect(link).toHaveAttribute('href', '/vehicles/v1')
  })

  it('asks a signed-out visitor to log in first', () => {
    renderCard(vehicle, { signedIn: false })

    const link = screen.getByRole('link', { name: /login to view/i })
    expect(link).toHaveAttribute('href', '/login')
    expect(
      screen.queryByRole('link', { name: /view car/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the out-of-stock badge when the quantity is zero', () => {
    renderCard({ ...vehicle, quantity: 0 })

    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })

  it('shows the vehicle photo when an image url is set', () => {
    renderCard({ ...vehicle, imageUrl: 'https://example.com/corolla.jpg' })

    const img = screen.getByRole('img', { name: /toyota corolla/i })
    expect(img).toHaveAttribute('src', 'https://example.com/corolla.jpg')
  })

  it('falls back to a placeholder when there is no image', () => {
    renderCard()

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
