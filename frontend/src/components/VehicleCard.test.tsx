import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('VehicleCard', () => {
  it('shows the vehicle details', () => {
    render(<VehicleCard vehicle={vehicle} onPurchase={vi.fn()} />)

    expect(screen.getByText(/toyota/i)).toBeInTheDocument()
    expect(screen.getByText(/corolla/i)).toBeInTheDocument()
    expect(screen.getByText(/sedan/i)).toBeInTheDocument()
    expect(screen.getByText('$20,000')).toBeInTheDocument()
    expect(screen.getByText(/3 in stock/i)).toBeInTheDocument()
  })

  it('enables the purchase button when stock is available', () => {
    render(<VehicleCard vehicle={vehicle} onPurchase={vi.fn()} />)

    expect(screen.getByRole('button', { name: /purchase/i })).toBeEnabled()
  })

  it('disables the purchase button when the quantity is zero', () => {
    render(
      <VehicleCard vehicle={{ ...vehicle, quantity: 0 }} onPurchase={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: /purchase/i })).toBeDisabled()
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })

  it('calls onPurchase with the vehicle when clicked', async () => {
    const onPurchase = vi.fn()
    render(<VehicleCard vehicle={vehicle} onPurchase={onPurchase} />)

    await userEvent.click(screen.getByRole('button', { name: /purchase/i }))

    expect(onPurchase).toHaveBeenCalledWith(vehicle)
  })
})
