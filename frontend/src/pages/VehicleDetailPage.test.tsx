import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { ToastProvider } from '../components/Toast'
import { VehicleDetailPage } from './VehicleDetailPage'
import * as vehiclesApi from '../api/vehicles.api'
import { ApiError, setToken } from '../api/client'
import type { User, Vehicle } from '../api/schemas'

vi.mock('../api/vehicles.api')

const customer: User = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

const fortuner: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Fortuner',
  category: 'SUV',
  price: 45000,
  quantity: 3,
  imageUrl: 'https://example.com/fortuner.jpg',
}

function renderDetail() {
  setToken('jwt')
  localStorage.setItem('authUser', JSON.stringify(customer))
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/vehicles/v1']}>
          <Routes>
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/" element={<div>HOME PAGE</div>} />
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(vehiclesApi.getVehicle).mockResolvedValue(fortuner)
})

describe('VehicleDetailPage', () => {
  it('loads and shows the full vehicle details', async () => {
    renderDetail()

    expect(await screen.findByRole('heading', { name: /toyota fortuner/i })).toBeInTheDocument()
    expect(vehiclesApi.getVehicle).toHaveBeenCalledWith('v1')
    expect(screen.getByText(/suv/i)).toBeInTheDocument()
    expect(screen.getByText('$45,000')).toBeInTheDocument()
    expect(screen.getAllByText(/3 in stock/i).length).toBeGreaterThan(0)
    expect(
      screen.getByRole('img', { name: /toyota fortuner/i }),
    ).toHaveAttribute('src', fortuner.imageUrl!)
  })

  it('purchases from the detail page and updates the stock', async () => {
    vi.mocked(vehiclesApi.purchaseVehicle).mockResolvedValue({
      vehicle: { ...fortuner, quantity: 2 },
      purchase: {
        id: 'p1',
        quantity: 1,
        purchasePrice: 45000,
        purchasedAt: '2026-07-22T10:00:00.000Z',
      },
    })
    renderDetail()

    await screen.findByRole('heading', { name: /toyota fortuner/i })
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }))

    expect(vehiclesApi.purchaseVehicle).toHaveBeenCalledWith('v1')
    expect((await screen.findAllByText(/2 in stock/i)).length).toBeGreaterThan(
      0,
    )
    expect(
      await screen.findByText(/purchased toyota fortuner/i),
    ).toBeInTheDocument()
  })

  it('disables the purchase button when the vehicle is out of stock', async () => {
    vi.mocked(vehiclesApi.getVehicle).mockResolvedValue({
      ...fortuner,
      quantity: 0,
    })
    renderDetail()

    await screen.findByRole('heading', { name: /toyota fortuner/i })
    expect(screen.getByRole('button', { name: /purchase/i })).toBeDisabled()
    expect(screen.getAllByText(/out of stock/i).length).toBeGreaterThan(0)
  })

  it('shows an error state when the vehicle does not exist', async () => {
    vi.mocked(vehiclesApi.getVehicle).mockRejectedValue(
      new ApiError(404, 'Vehicle not found'),
    )
    renderDetail()

    expect(await screen.findByText(/vehicle not found/i)).toBeInTheDocument()
  })

  it('links back to the home page', async () => {
    renderDetail()

    await screen.findByRole('heading', { name: /toyota fortuner/i })
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
