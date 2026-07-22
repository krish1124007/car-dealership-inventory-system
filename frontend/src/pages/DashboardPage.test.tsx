import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { ToastProvider } from '../components/Toast'
import { DashboardPage } from './DashboardPage'
import * as vehiclesApi from '../api/vehicles.api'
import { setToken } from '../api/client'
import type { User, Vehicle } from '../api/schemas'

vi.mock('../api/vehicles.api')

const customer: User = {
  id: 'u1',
  name: 'Krish',
  email: 'krish@example.com',
  role: 'CUSTOMER',
}

const corolla: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 20000,
  quantity: 3,
}

const city: Vehicle = {
  id: 'v2',
  make: 'Honda',
  model: 'City',
  category: 'Sedan',
  price: 18000,
  quantity: 0,
}

function renderDashboard() {
  setToken('jwt')
  localStorage.setItem('authUser', JSON.stringify(customer))
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(vehiclesApi.listVehicles).mockResolvedValue([corolla, city])
})

describe('DashboardPage', () => {
  it('shows how many vehicles are available', async () => {
    renderDashboard()

    expect(
      await screen.findByText(/2 vehicles available/i),
    ).toBeInTheDocument()
  })

  it('filters by category from the filter bar', async () => {
    vi.mocked(vehiclesApi.searchVehicles).mockResolvedValue([corolla])
    renderDashboard()

    await screen.findByText(/corolla/i)
    await userEvent.selectOptions(
      screen.getByLabelText(/category/i),
      'Sedan',
    )
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Sedan' }),
    )
  })

  it('lists every vehicle returned by the api', async () => {
    renderDashboard()

    expect(await screen.findByText(/corolla/i)).toBeInTheDocument()
    expect(screen.getByText(/city/i)).toBeInTheDocument()
    expect(screen.getByText('$20,000')).toBeInTheDocument()
  })

  it('links every card to its vehicle detail page', async () => {
    renderDashboard()

    await screen.findByText(/corolla/i)
    const links = screen.getAllByRole('link', { name: /view car/i })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/vehicles/v1')
    expect(links[1]).toHaveAttribute('href', '/vehicles/v2')
  })

  it('searches by car name from the top search bar', async () => {
    vi.mocked(vehiclesApi.searchVehicles).mockResolvedValue([corolla])
    renderDashboard()

    await screen.findByText(/city/i)
    await userEvent.type(screen.getByRole('searchbox'), 'Toyota')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(vehiclesApi.searchVehicles).toHaveBeenCalledWith({ q: 'Toyota' })
    await waitFor(() =>
      expect(screen.queryByText(/city/i)).not.toBeInTheDocument(),
    )
    expect(screen.getByText(/corolla/i)).toBeInTheDocument()
  })

  it('shows an empty state when the search finds nothing', async () => {
    vi.mocked(vehiclesApi.searchVehicles).mockResolvedValue([])
    renderDashboard()

    await screen.findByText(/corolla/i)
    await userEvent.type(screen.getByRole('searchbox'), 'Ferrari')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByText(/no vehicles found/i)).toBeInTheDocument()
  })

  it('reset brings back the full list', async () => {
    vi.mocked(vehiclesApi.searchVehicles).mockResolvedValue([corolla])
    renderDashboard()

    await screen.findByText(/city/i)
    await userEvent.type(screen.getByRole('searchbox'), 'Toyota')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
    await waitFor(() =>
      expect(screen.queryByText(/city/i)).not.toBeInTheDocument(),
    )

    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(await screen.findByText(/city/i)).toBeInTheDocument()
    expect(vehiclesApi.listVehicles).toHaveBeenCalledTimes(2)
  })
})
