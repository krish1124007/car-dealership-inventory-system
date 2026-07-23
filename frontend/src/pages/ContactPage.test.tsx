import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { ToastProvider } from '../components/Toast'
import { ContactPage } from './ContactPage'
import * as contactApi from '../api/contact.api'
import { ApiError } from '../api/client'

vi.mock('../api/contact.api')

function renderContact() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/contact']}>
          <Routes>
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  )
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText(/your name/i), 'Riya Sharma')
  await userEvent.type(screen.getByLabelText(/email/i), 'riya@example.com')
  await userEvent.type(screen.getByLabelText(/subject/i), 'Test drive')
  await userEvent.type(
    screen.getByLabelText(/message/i),
    'Can I book a test drive this weekend?',
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(contactApi.sendContactMessage).mockResolvedValue(null)
})

describe('ContactPage', () => {
  it('offers the fields a visitor needs to write in', () => {
    renderContact()

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send message/i }),
    ).toBeInTheDocument()
  })

  it('sends what the visitor wrote', async () => {
    renderContact()
    await fillForm()

    await userEvent.click(screen.getByRole('button', { name: /send message/i }))

    expect(contactApi.sendContactMessage).toHaveBeenCalledWith({
      name: 'Riya Sharma',
      email: 'riya@example.com',
      subject: 'Test drive',
      message: 'Can I book a test drive this weekend?',
    })
  })

  it('confirms the message was sent and clears the form', async () => {
    renderContact()
    await fillForm()

    await userEvent.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      /message sent|thank/i,
    )
    expect(screen.getByLabelText(/your name/i)).toHaveValue('')
    expect(screen.getByLabelText(/message/i)).toHaveValue('')
  })

  it('does not require a subject', async () => {
    renderContact()
    await userEvent.type(screen.getByLabelText(/your name/i), 'Riya')
    await userEvent.type(screen.getByLabelText(/email/i), 'riya@example.com')
    await userEvent.type(screen.getByLabelText(/message/i), 'Hello there')

    await userEvent.click(screen.getByRole('button', { name: /send message/i }))

    expect(contactApi.sendContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({ subject: undefined }),
    )
  })

  it('surfaces a server error instead of pretending it sent', async () => {
    vi.mocked(contactApi.sendContactMessage).mockRejectedValue(
      new ApiError(400, 'Invalid contact details'),
    )
    renderContact()
    await fillForm()

    await userEvent.click(screen.getByRole('button', { name: /send message/i }))

    // Errors are announced assertively, so the toast takes role="alert".
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /invalid contact details/i,
    )
    expect(screen.getByLabelText(/your name/i)).toHaveValue('Riya Sharma')
  })
})
