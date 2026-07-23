import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { ToastProvider } from '../components/Toast'
import { DashboardPage } from './DashboardPage'
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

const city: Vehicle = {
  id: 'v2',
  make: 'Honda',
  model: 'City',
  category: 'Sedan',
  price: 18000,
  quantity: 0,
}

function renderHome() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cars" element={<div>CARS PAGE</div>} />
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

describe('DashboardPage (home)', () => {
  it('shows the promotional banner carousel', () => {
    renderHome()

    expect(
      screen.getByRole('region', { name: /promotions/i }),
    ).toBeInTheDocument()
    // Three slides, reachable via their dots.
    expect(
      screen.getByRole('button', { name: /go to slide 1/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /go to slide 3/i }),
    ).toBeInTheDocument()
  })

  it('switches banner slides from the dots', async () => {
    renderHome()

    await userEvent.click(
      screen.getByRole('button', { name: /go to slide 2/i }),
    )

    const region = screen.getByRole('region', { name: /promotions/i })
    expect(region.textContent).toMatch(/./)
  })

  it('banner call-to-action leads to the cars page', async () => {
    renderHome()

    await userEvent.click(
      screen.getAllByRole('link', { name: /browse cars/i })[0]!,
    )

    expect(await screen.findByText('CARS PAGE')).toBeInTheDocument()
  })

  it('lists every vehicle below the banners', async () => {
    renderHome()

    expect(await screen.findByText(/corolla/i)).toBeInTheDocument()
    expect(screen.getByText(/city/i)).toBeInTheDocument()
    expect(screen.getByText('$20,000')).toBeInTheDocument()
  })

  it('links every card to its vehicle detail page', async () => {
    renderHome()

    await screen.findByText(/corolla/i)
    const links = screen.getAllByRole('link', { name: /view car/i })
    expect(links[0]).toHaveAttribute('href', '/vehicles/v1')
  })
})
