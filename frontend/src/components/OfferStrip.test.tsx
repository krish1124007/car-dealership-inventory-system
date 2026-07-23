import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { OfferStrip } from './OfferStrip'

describe('OfferStrip', () => {
  it('is a labelled region so screen readers can skip it', () => {
    render(<OfferStrip />)

    expect(
      screen.getByRole('region', { name: /offers/i }),
    ).toBeInTheDocument()
  })

  it('advertises the guaranteed discount', () => {
    render(<OfferStrip />)
    const strip = screen.getByRole('region', { name: /offers/i })

    expect(within(strip).getByText(/guaranteed discount/i)).toBeInTheDocument()
  })

  it('advertises the two-year unlimited-mileage warranty', () => {
    render(<OfferStrip />)
    const strip = screen.getByRole('region', { name: /offers/i })

    expect(within(strip).getByText(/2-year warranty/i)).toBeInTheDocument()
    expect(within(strip).getByText(/unlimited mileage/i)).toBeInTheDocument()
  })

  it('advertises cashback of up to twenty thousand rupees', () => {
    render(<OfferStrip />)
    const strip = screen.getByRole('region', { name: /offers/i })

    expect(within(strip).getByText(/₹20,000 cashback/i)).toBeInTheDocument()
  })
})
