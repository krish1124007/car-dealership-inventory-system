import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ToastProvider } from './Toast'
import { AdminUsersPanel } from './AdminUsersPanel'
import * as adminApi from '../api/admin.api'
import type { AdminUser } from '../api/schemas'

vi.mock('../api/admin.api')

const users: AdminUser[] = [
  {
    id: 'a1',
    name: 'Site Admin',
    email: 'admin@cardealership.com',
    role: 'ADMIN',
    createdAt: '2026-07-20T09:00:00.000Z',
    lastLoginAt: '2026-07-23T11:31:00.000Z',
  },
  {
    id: 'u1',
    name: 'Riya Sharma',
    email: 'riya@example.com',
    role: 'CUSTOMER',
    createdAt: '2026-07-21T09:00:00.000Z',
  },
]

function renderPanel() {
  return render(
    <ToastProvider>
      <AdminUsersPanel />
    </ToastProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(adminApi.listUsers).mockResolvedValue({ total: 2, users })
})

describe('AdminUsersPanel', () => {
  it('lists everyone registered on the site', async () => {
    renderPanel()

    expect(await screen.findByText('Riya Sharma')).toBeInTheDocument()
    expect(screen.getByText('Site Admin')).toBeInTheDocument()
    expect(screen.getByText('riya@example.com')).toBeInTheDocument()
  })

  it('shows how many users there are in total', async () => {
    renderPanel()
    const panel = await screen.findByRole('region', {
      name: /registered users/i,
    })

    expect(within(panel).getByText('2')).toBeInTheDocument()
    expect(within(panel).getByText(/total/i)).toBeInTheDocument()
  })

  it('shows when a user last signed in', async () => {
    renderPanel()

    await screen.findByText('Site Admin')
    expect(screen.getByText(/23 Jul 2026/)).toBeInTheDocument()
  })

  it('says so plainly when a user has never signed in', async () => {
    renderPanel()

    expect(await screen.findByText(/never signed in/i)).toBeInTheDocument()
  })

  it('marks which accounts are admins', async () => {
    renderPanel()

    await screen.findByText('Site Admin')
    expect(screen.getByText(/^admin$/i)).toBeInTheDocument()
    expect(screen.getByText(/^customer$/i)).toBeInTheDocument()
  })

  it('shows an empty state rather than a blank table', async () => {
    vi.mocked(adminApi.listUsers).mockResolvedValue({ total: 0, users: [] })
    renderPanel()

    expect(
      await screen.findByText(/nobody has registered yet/i),
    ).toBeInTheDocument()
  })
})
