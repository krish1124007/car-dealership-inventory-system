import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from './Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('carries the brand and a current-year copyright', () => {
    renderFooter()

    // The name appears twice — as the wordmark and inside the copyright.
    expect(screen.getAllByText(/car dealership/i).length).toBeGreaterThan(0)
    expect(
      screen.getByText(
        new RegExp(`©\\s*${new Date().getFullYear()}.*all rights reserved`, 'i'),
      ),
    ).toBeInTheDocument()
  })

  it('links to the main pages', () => {
    renderFooter()

    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: /all cars/i })).toHaveAttribute(
      'href',
      '/cars',
    )
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  it('links to the car collections', () => {
    renderFooter()

    expect(
      screen.getByRole('link', { name: /electric cars/i }),
    ).toHaveAttribute('href', '/cars?category=EV')
    expect(
      screen.getByRole('link', { name: /pre-launch cars/i }),
    ).toHaveAttribute('href', '/cars?type=pre-launch')
  })

  it('shows how to reach the showroom', () => {
    renderFooter()

    expect(screen.getByText(/\+91 98250 00000/)).toBeInTheDocument()
    expect(screen.getByText(/hello@cardealership\.com/)).toBeInTheDocument()
    expect(screen.getByText(/ahmedabad/i)).toBeInTheDocument()
    expect(screen.getByText(/9am to 8pm/i)).toBeInTheDocument()
  })

  it('states that prices are ex-showroom', () => {
    renderFooter()

    expect(screen.getByText(/ex-showroom/i)).toBeInTheDocument()
  })

  it('groups the links under headings', () => {
    renderFooter()

    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText(/^explore$/i)).toBeInTheDocument()
    expect(within(footer).getByText(/^collections$/i)).toBeInTheDocument()
    expect(within(footer).getByText(/^reach us$/i)).toBeInTheDocument()
  })
})
