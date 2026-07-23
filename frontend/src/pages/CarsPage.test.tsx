import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { ToastProvider } from '../components/Toast'
import { CarsPage } from './CarsPage'
import * as vehiclesApi from '../api/vehicles.api'
import type { Vehicle } from '../api/schemas'

vi.mock('../api/vehicles.api')

const corolla: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 20000,
  quantity: 3,
}

const wrangler: Vehicle = {
  id: 'v2',
  make: 'Jeep',
  model: 'Wrangler',
  category: 'SUV',
  price: 42000,
  quantity: 2,
}

function renderCars(initialEntry = '/cars') {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/cars" element={<CarsPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(vehiclesApi.listVehicles).mockResolvedValue([corolla, wrangler])
  vi.mocked(vehiclesApi.searchVehicles).mockResolvedValue([corolla])
})

describe('CarsPage', () => {
  it('lists all cars with a count', async () => {
    renderCars()

    expect(await screen.findByText(/corolla/i)).toBeInTheDocument()
    expect(screen.getByText(/wrangler/i)).toBeInTheDocument()
    expect(screen.getByText(/2 vehicles available/i)).toBeInTheDocument()
  })

  it('applies the name search from the sidebar', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    await userEvent.type(screen.getByRole('searchbox'), 'Toyota')
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'Toyota' }),
    )
    await waitFor(() =>
      expect(screen.queryByText(/wrangler/i)).not.toBeInTheDocument(),
    )
  })

  it('filters by category from the sidebar', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    await userEvent.click(screen.getByRole('radio', { name: /suv/i }))
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'SUV' }),
    )
  })

  it('filters by price range from the sidebar', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    await userEvent.type(screen.getByLabelText(/min price/i), '10000')
    await userEvent.type(screen.getByLabelText(/max price/i), '30000')
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: 10000, maxPrice: 30000 }),
    )
  })

  it('runs the navbar-provided query from the url on load', async () => {
    renderCars('/cars?q=Corolla')

    await waitFor(() =>
      expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'Corolla' }),
      ),
    )
    expect(await screen.findByText(/corolla/i)).toBeInTheDocument()
  })

  it('reset restores the full list', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    await userEvent.type(screen.getByRole('searchbox'), 'Toyota')
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))
    await waitFor(() =>
      expect(screen.queryByText(/wrangler/i)).not.toBeInTheDocument(),
    )

    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(await screen.findByText(/wrangler/i)).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', async () => {
    vi.mocked(vehiclesApi.searchVehicles).mockResolvedValue([])
    renderCars()

    await screen.findByText(/wrangler/i)
    await userEvent.type(screen.getByRole('searchbox'), 'Ferrari')
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(await screen.findByText(/no vehicles found/i)).toBeInTheDocument()
  })
})
