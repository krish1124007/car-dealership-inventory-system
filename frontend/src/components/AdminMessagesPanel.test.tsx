import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ToastProvider } from './Toast'
import { AdminMessagesPanel } from './AdminMessagesPanel'
import * as contactApi from '../api/contact.api'
import type { ContactMessage } from '../api/schemas'

vi.mock('../api/contact.api')

const messages: ContactMessage[] = [
  {
    id: 'm2',
    name: 'Riya Sharma',
    email: 'riya@example.com',
    subject: 'Test drive for the Creta',
    message: 'Can I book a test drive this weekend in Ahmedabad?',
    createdAt: '2026-07-23T10:00:00.000Z',
  },
  {
    id: 'm1',
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    message: 'Do you accept exchange on an old Swift?',
    createdAt: '2026-07-22T10:00:00.000Z',
  },
]

function renderPanel() {
  return render(
    <ToastProvider>
      <AdminMessagesPanel />
    </ToastProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(contactApi.listContactMessages).mockResolvedValue({
    total: 2,
    messages,
  })
})

describe('AdminMessagesPanel', () => {
  it('shows what visitors actually wrote', async () => {
    renderPanel()

    expect(
      await screen.findByText(/can i book a test drive this weekend/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/do you accept exchange on an old swift/i),
    ).toBeInTheDocument()
  })

  it('shows who wrote it and when', async () => {
    renderPanel()

    expect(await screen.findByText('Riya Sharma')).toBeInTheDocument()
    expect(screen.getByText(/23 Jul 2026/)).toBeInTheDocument()
  })

  it('makes the sender email a mailto link so the admin can reply', async () => {
    renderPanel()

    const link = await screen.findByRole('link', { name: 'riya@example.com' })
    expect(link).toHaveAttribute('href', 'mailto:riya@example.com')
  })

  it('shows the subject when there is one', async () => {
    renderPanel()

    expect(
      await screen.findByText(/test drive for the creta/i),
    ).toBeInTheDocument()
  })

  it('counts how many messages have arrived', async () => {
    renderPanel()
    const panel = await screen.findByRole('region', {
      name: /contact messages/i,
    })

    expect(within(panel).getByText('2')).toBeInTheDocument()
  })

  it('shows an empty inbox state', async () => {
    vi.mocked(contactApi.listContactMessages).mockResolvedValue({
      total: 0,
      messages: [],
    })
    renderPanel()

    expect(await screen.findByText(/no messages yet/i)).toBeInTheDocument()
  })
})
