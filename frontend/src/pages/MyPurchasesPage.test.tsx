import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { MyPurchasesPage } from './MyPurchasesPage'
import * as usersApi from '../api/users.api'
import { setToken } from '../api/client'
import type { User } from '../api/schemas'

vi.mock('../api/users.api')

const customer: User = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

function renderPage() {
  setToken('jwt')
  localStorage.setItem('authUser', JSON.stringify(customer))
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/purchases']}>
        <Routes>
          <Route path="/purchases" element={<MyPurchasesPage />} />
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MyPurchasesPage', () => {
  it('lists purchases with the vehicle details and price paid', async () => {
    vi.mocked(usersApi.getMyPurchases).mockResolvedValue([
      {
        id: 'p1',
        quantity: 1,
        purchasePrice: 45000,
        purchasedAt: '2026-07-20T10:00:00.000Z',
        vehicle: {
          id: 'v1',
          make: 'Toyota',
          model: 'Fortuner',
          category: 'SUV',
          price: 47000,
          quantity: 2,
        },
      },
    ])
    renderPage()

    expect(await screen.findByText(/fortuner/i)).toBeInTheDocument()
    expect(screen.getByText('$45,000')).toBeInTheDocument()
  })

  it('shows the vehicle photo on the purchase entry', async () => {
    vi.mocked(usersApi.getMyPurchases).mockResolvedValue([
      {
        id: 'p1',
        quantity: 1,
        purchasePrice: 45000,
        purchasedAt: '2026-07-20T10:00:00.000Z',
        vehicle: {
          id: 'v1',
          make: 'Toyota',
          model: 'Fortuner',
          category: 'SUV',
          price: 47000,
          quantity: 2,
          imageUrl: 'https://example.com/fortuner.jpg',
        },
      },
    ])
    renderPage()

    const img = await screen.findByRole('img', { name: /toyota fortuner/i })
    expect(img).toHaveAttribute('src', 'https://example.com/fortuner.jpg')
  })

  it('shows a placeholder tile when the vehicle has no photo', async () => {
    vi.mocked(usersApi.getMyPurchases).mockResolvedValue([
      {
        id: 'p1',
        quantity: 1,
        purchasePrice: 45000,
        purchasedAt: '2026-07-20T10:00:00.000Z',
        vehicle: {
          id: 'v1',
          make: 'Toyota',
          model: 'Fortuner',
          category: 'SUV',
          price: 47000,
          quantity: 2,
        },
      },
    ])
    renderPage()

    await screen.findByText(/fortuner/i)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('falls back gracefully when the vehicle was deleted', async () => {
    vi.mocked(usersApi.getMyPurchases).mockResolvedValue([
      {
        id: 'p1',
        quantity: 1,
        purchasePrice: 45000,
        purchasedAt: '2026-07-20T10:00:00.000Z',
        vehicle: null,
      },
    ])
    renderPage()

    expect(
      await screen.findByText(/no longer available/i),
    ).toBeInTheDocument()
    expect(screen.getByText('$45,000')).toBeInTheDocument()
  })

  it('shows an empty state when nothing was bought yet', async () => {
    vi.mocked(usersApi.getMyPurchases).mockResolvedValue([])
    renderPage()

    expect(await screen.findByText(/no purchases yet/i)).toBeInTheDocument()
  })
})
