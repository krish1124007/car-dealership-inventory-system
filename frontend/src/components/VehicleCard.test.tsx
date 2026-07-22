import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { VehicleCard } from './VehicleCard'
import type { Vehicle } from '../api/schemas'

const vehicle: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 20000,
  quantity: 3,
}

function renderCard(v: Vehicle = vehicle) {
  return render(
    <MemoryRouter>
      <VehicleCard vehicle={v} />
    </MemoryRouter>,
  )
}

describe('VehicleCard', () => {
  it('shows the vehicle details', () => {
    renderCard()

    expect(screen.getByText(/toyota/i)).toBeInTheDocument()
    expect(screen.getByText(/corolla/i)).toBeInTheDocument()
    expect(screen.getByText(/sedan/i)).toBeInTheDocument()
    expect(screen.getByText('$20,000')).toBeInTheDocument()
    expect(screen.getByText(/3 in stock/i)).toBeInTheDocument()
  })

  it('links to the vehicle detail page', () => {
    renderCard()

    const link = screen.getByRole('link', { name: /view car/i })
    expect(link).toHaveAttribute('href', '/vehicles/v1')
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
