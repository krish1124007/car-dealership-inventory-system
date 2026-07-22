import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from './Toast'

function Trigger() {
  const toast = useToast()
  return (
    <div>
      <button onClick={() => toast.success('Saved successfully')}>
        trigger-success
      </button>
      <button onClick={() => toast.error('Something broke')}>
        trigger-error
      </button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <Trigger />
    </ToastProvider>,
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastProvider', () => {
  it('shows a success toast with role status', () => {
    renderWithProvider()

    fireEvent.click(screen.getByText('trigger-success'))

    const toast = screen.getByRole('status')
    expect(toast).toHaveTextContent('Saved successfully')
  })

  it('shows an error toast with role alert', () => {
    renderWithProvider()

    fireEvent.click(screen.getByText('trigger-error'))

    const toast = screen.getByRole('alert')
    expect(toast).toHaveTextContent('Something broke')
  })

  it('stacks multiple toasts at once', () => {
    renderWithProvider()

    fireEvent.click(screen.getByText('trigger-success'))
    fireEvent.click(screen.getByText('trigger-error'))

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('dismisses a toast when its close button is clicked', () => {
    renderWithProvider()

    fireEvent.click(screen.getByText('trigger-success'))
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('auto-dismisses after a few seconds', () => {
    vi.useFakeTimers()
    renderWithProvider()

    fireEvent.click(screen.getByText('trigger-success'))
    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
