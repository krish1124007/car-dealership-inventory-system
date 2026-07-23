import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { ToastProvider } from '../components/Toast'
import { DashboardPage } from './DashboardPage'
import * as vehiclesApi from '../api/vehicles.api'
import type { Vehicle } from '../api/schemas'

vi.mock('../api/vehicles.api')

function vehicle(
  id: string,
  make: string,
  model: string,
  price: number,
): Vehicle {
  return { id, make, model, category: 'Sedan', price, quantity: 2 }
}

const inventory: Vehicle[] = [
  vehicle('v1', 'Porsche', '911 Carrera', 115000),
  vehicle('v2', 'BMW', 'M4', 82000),
  vehicle('v3', 'Jeep', 'Wrangler', 42000),
  vehicle('v4', 'Toyota', 'Corolla', 20000),
  vehicle('v5', 'Honda', 'City', 18000),
]

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
  vi.mocked(vehiclesApi.listVehicles).mockResolvedValue(inventory)
})

describe('DashboardPage (home)', () => {
  it('shows the promotional banner carousel', () => {
    renderHome()

    expect(
      screen.getByRole('region', { name: /promotions/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /go to slide 1/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /go to slide 3/i }),
    ).toBeInTheDocument()
  })

  it('banner call-to-action leads to the cars page', async () => {
    renderHome()

    await userEvent.click(
      screen.getAllByRole('link', { name: /browse cars/i })[0]!,
    )

    expect(await screen.findByText('CARS PAGE')).toBeInTheDocument()
  })

  it('shows the priciest cars in the luxury collection', async () => {
    renderHome()

    const luxury = await screen.findByRole('region', {
      name: /luxury cars collection/i,
    })
    expect(within(luxury).getByText(/porsche/i)).toBeInTheDocument()
    expect(within(luxury).getByText(/bmw/i)).toBeInTheDocument()
    expect(within(luxury).queryByText(/city/i)).not.toBeInTheDocument()
  })

  it('shows the cheapest cars in the affordable collection', async () => {
    renderHome()

    const affordable = await screen.findByRole('region', {
      name: /affordable cars collection/i,
    })
    expect(within(affordable).getByText(/city/i)).toBeInTheDocument()
    expect(within(affordable).getByText(/corolla/i)).toBeInTheDocument()
    expect(
      within(affordable).queryByText(/porsche/i),
    ).not.toBeInTheDocument()
  })

  it('ends every collection with a View more link to the cars page', async () => {
    renderHome()

    await screen.findByRole('region', { name: /luxury cars collection/i })
    const viewMoreLinks = screen.getAllByRole('link', { name: /view more/i })
    expect(viewMoreLinks).toHaveLength(2)
    for (const link of viewMoreLinks) {
      expect(link).toHaveAttribute('href', '/cars')
    }
  })

  it('closes with an invitation to visit the full collection', async () => {
    renderHome()

    expect(
      await screen.findByText(/explore our full collection/i),
    ).toBeInTheDocument()
  })

  it('shows a simple footer', () => {
    renderHome()

    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText(/car dealership/i)).toBeInTheDocument()
  })
})
