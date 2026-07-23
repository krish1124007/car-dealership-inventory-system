import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

  it('has no apply button — filters apply on change', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    expect(
      screen.queryByRole('button', { name: /apply/i }),
    ).not.toBeInTheDocument()
  })

  it('applies the name search automatically while typing', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    await userEvent.type(
      screen.getByRole('searchbox', { name: /search by name/i }),
      'Toyota',
    )

    await waitFor(() =>
      expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'Toyota' }),
      ),
    )
    await waitFor(() =>
      expect(screen.queryByText(/wrangler/i)).not.toBeInTheDocument(),
    )
  })

  it('applies the category filter as soon as it is picked', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    await userEvent.click(screen.getByRole('radio', { name: /suv/i }))

    await waitFor(() =>
      expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'SUV' }),
      ),
    )
  })

  it('applies the price slider (0 to max price) as soon as it moves', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    const slider = screen.getByRole('slider', { name: /price range/i })
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '42000')

    fireEvent.change(slider, { target: { value: '30000' } })

    expect(screen.getByText(/up to ₹30,000/i)).toBeInTheDocument()
    await waitFor(() =>
      expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
        expect.objectContaining({ maxPrice: 30000 }),
      ),
    )
  })

  it('does not send a price filter when the slider stays at the max', async () => {
    renderCars()

    await screen.findByText(/wrangler/i)
    await userEvent.type(
      screen.getByRole('searchbox', { name: /search by name/i }),
      'Toyota',
    )

    await waitFor(() =>
      expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith({ q: 'Toyota' }),
    )
  })

  it('applies a category from the url on load', async () => {
    renderCars('/cars?category=SUV')

    await waitFor(() =>
      expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'SUV' }),
      ),
    )
  })

  it('the petrol filter hides electric cars', async () => {
    vi.mocked(vehiclesApi.listVehicles).mockResolvedValue([
      corolla,
      wrangler,
      {
        id: 'v3',
        make: 'Tesla',
        model: 'Model 3',
        category: 'EV',
        price: 4000000,
        quantity: 2,
      },
    ])
    renderCars('/cars?fuel=petrol')

    expect(await screen.findByText(/corolla/i)).toBeInTheDocument()
    expect(screen.getByText(/wrangler/i)).toBeInTheDocument()
    expect(screen.queryByText(/tesla/i)).not.toBeInTheDocument()
    expect(screen.getByText(/2 vehicles available/i)).toBeInTheDocument()
  })

  it('the pre-launch filter shows only pre-launch cars', async () => {
    vi.mocked(vehiclesApi.listVehicles).mockResolvedValue([
      corolla,
      wrangler,
      {
        id: 'v4',
        make: 'Tata',
        model: 'Avinya',
        category: 'EV',
        fuelType: 'ELECTRIC',
        preLaunch: true,
        price: 3000000,
        quantity: 0,
      },
    ])
    renderCars('/cars?type=pre-launch')

    expect(await screen.findByText(/avinya/i)).toBeInTheDocument()
    expect(screen.queryByText(/corolla/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/wrangler/i)).not.toBeInTheDocument()
    expect(screen.getByText(/1 vehicle available/i)).toBeInTheDocument()
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
    await userEvent.type(
      screen.getByRole('searchbox', { name: /search by name/i }),
      'Toyota',
    )
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
    await userEvent.type(
      screen.getByRole('searchbox', { name: /search by name/i }),
      'Ferrari',
    )

    expect(await screen.findByText(/no vehicles found/i)).toBeInTheDocument()
  })
})
