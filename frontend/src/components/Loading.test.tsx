import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from './Loading'

describe('Loading', () => {
  it('shows the default label', () => {
    render(<Loading />)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows a caller-supplied label', () => {
    render(<Loading label="Loading vehicles…" />)

    expect(screen.getByText('Loading vehicles…')).toBeInTheDocument()
  })

  it('animates with css rather than an image asset', () => {
    const { container } = render(<Loading />)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.lane-track')).toBeInTheDocument()
  })
})
