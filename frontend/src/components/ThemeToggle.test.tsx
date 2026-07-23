import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../theme/ThemeContext'
import { ThemeToggle } from './ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  // jsdom has no matchMedia; default the system preference to light.
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ThemeToggle', () => {
  it('starts in light mode when the system prefers light', () => {
    renderToggle()

    expect(document.documentElement).not.toHaveClass('dark')
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument()
  })

  it('switches the whole page to dark and back', async () => {
    renderToggle()

    await userEvent.click(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    )
    expect(document.documentElement).toHaveClass('dark')

    await userEvent.click(
      screen.getByRole('button', { name: /switch to light mode/i }),
    )
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('remembers the choice for the next visit', async () => {
    renderToggle()

    await userEvent.click(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    )

    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('starts light even when the system prefers dark — dark is opt-in', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn() }),
    )
    renderToggle()

    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('restores a previously chosen dark theme', () => {
    localStorage.setItem('theme', 'dark')
    renderToggle()

    expect(document.documentElement).toHaveClass('dark')
  })
})
