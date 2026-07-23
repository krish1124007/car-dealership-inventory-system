import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext'
import { ToastProvider } from '../components/Toast'
import { AdminPage } from './AdminPage'
import * as vehiclesApi from '../api/vehicles.api'
import * as uploadsApi from '../api/uploads.api'
import { setToken } from '../api/client'
import type { User, Vehicle } from '../api/schemas'

vi.mock('../api/vehicles.api')
vi.mock('../api/uploads.api')

const admin: User = {
  id: 'a1',
  name: 'Site Admin',
  email: 'admin@example.com',
  role: 'ADMIN',
}

const corolla: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 20000,
  quantity: 3,
}

function renderAdmin() {
  setToken('jwt')
  localStorage.setItem('authUser', JSON.stringify(admin))
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<div>LOGIN PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(vehiclesApi.listVehicles).mockResolvedValue([corolla])
})

describe('AdminPage', () => {
  it('lists the existing inventory', async () => {
    renderAdmin()

    expect(await screen.findByText(/corolla/i)).toBeInTheDocument()
  })

  it('adds a new vehicle through the form', async () => {
    vi.mocked(vehiclesApi.createVehicle).mockResolvedValue({
      id: 'v9',
      make: 'Tesla',
      model: 'Model 3',
      category: 'EV',
      price: 50000,
      quantity: 2,
    })
    renderAdmin()
    await screen.findByText(/corolla/i)

    await userEvent.type(screen.getByLabelText(/make/i), 'Tesla')
    await userEvent.type(screen.getByLabelText(/model/i), 'Model 3')
    await userEvent.type(screen.getByLabelText(/category/i), 'EV')
    await userEvent.type(screen.getByLabelText(/price/i), '50000')
    await userEvent.type(screen.getByLabelText(/^quantity$/i), '2')
    await userEvent.click(
      screen.getByRole('button', { name: /add vehicle/i }),
    )

    expect(vehiclesApi.createVehicle).toHaveBeenCalledWith({
      make: 'Tesla',
      model: 'Model 3',
      category: 'EV',
      fuelType: 'PETROL',
      preLaunch: false,
      price: 50000,
      quantity: 2,
    })
    expect(await screen.findByText(/tesla/i)).toBeInTheDocument()
  })

  it('sends the chosen fuel type and pre-launch flag', async () => {
    vi.mocked(vehiclesApi.createVehicle).mockResolvedValue({
      id: 'v9',
      make: 'Tesla',
      model: 'Model 3',
      category: 'EV',
      fuelType: 'ELECTRIC',
      preLaunch: true,
      price: 50000,
      quantity: 2,
    })
    renderAdmin()
    await screen.findByText(/corolla/i)

    await userEvent.type(screen.getByLabelText(/make/i), 'Tesla')
    await userEvent.type(screen.getByLabelText(/model/i), 'Model 3')
    await userEvent.type(screen.getByLabelText(/category/i), 'EV')
    await userEvent.selectOptions(
      screen.getByLabelText(/fuel type/i),
      'ELECTRIC',
    )
    await userEvent.click(screen.getByLabelText(/pre-launch listing/i))
    await userEvent.type(screen.getByLabelText(/price/i), '50000')
    await userEvent.type(screen.getByLabelText(/^quantity$/i), '2')
    await userEvent.click(
      screen.getByRole('button', { name: /add vehicle/i }),
    )

    expect(vehiclesApi.createVehicle).toHaveBeenCalledWith(
      expect.objectContaining({ fuelType: 'ELECTRIC', preLaunch: true }),
    )
    expect(await screen.findByText(/tesla/i)).toBeInTheDocument()
  })

  it('uploads the selected photo and sends its url with the new vehicle', async () => {
    vi.mocked(uploadsApi.uploadVehicleImage).mockResolvedValue({
      url: 'http://localhost:3000/uploads/model3.jpg',
    })
    vi.mocked(vehiclesApi.createVehicle).mockResolvedValue({
      id: 'v9',
      make: 'Tesla',
      model: 'Model 3',
      category: 'EV',
      price: 50000,
      quantity: 2,
      imageUrl: 'http://localhost:3000/uploads/model3.jpg',
    })
    renderAdmin()
    await screen.findByText(/corolla/i)

    const file = new File(['img-bytes'], 'model3.jpg', { type: 'image/jpeg' })
    await userEvent.type(screen.getByLabelText(/make/i), 'Tesla')
    await userEvent.type(screen.getByLabelText(/model/i), 'Model 3')
    await userEvent.type(screen.getByLabelText(/category/i), 'EV')
    await userEvent.type(screen.getByLabelText(/price/i), '50000')
    await userEvent.type(screen.getByLabelText(/^quantity$/i), '2')
    await userEvent.upload(screen.getByLabelText(/vehicle photos/i), file)
    await userEvent.click(
      screen.getByRole('button', { name: /add vehicle/i }),
    )

    expect(uploadsApi.uploadVehicleImage).toHaveBeenCalledWith(file)
    expect(vehiclesApi.createVehicle).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: 'http://localhost:3000/uploads/model3.jpg',
      }),
    )
  })

  it('uploads several photos: first is the main image, the rest the gallery', async () => {
    vi.mocked(uploadsApi.uploadVehicleImage)
      .mockResolvedValueOnce({
        url: 'http://localhost:3000/uploads/front.jpg',
      })
      .mockResolvedValueOnce({
        url: 'http://localhost:3000/uploads/interior.jpg',
      })
      .mockResolvedValueOnce({
        url: 'http://localhost:3000/uploads/seats.jpg',
      })
    vi.mocked(vehiclesApi.createVehicle).mockResolvedValue({
      id: 'v9',
      make: 'Tesla',
      model: 'Model 3',
      category: 'EV',
      price: 50000,
      quantity: 2,
      imageUrl: 'http://localhost:3000/uploads/front.jpg',
      images: [
        'http://localhost:3000/uploads/interior.jpg',
        'http://localhost:3000/uploads/seats.jpg',
      ],
    })
    renderAdmin()
    await screen.findByText(/corolla/i)

    const files = [
      new File(['a'], 'front.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'interior.jpg', { type: 'image/jpeg' }),
      new File(['c'], 'seats.jpg', { type: 'image/jpeg' }),
    ]
    await userEvent.type(screen.getByLabelText(/make/i), 'Tesla')
    await userEvent.type(screen.getByLabelText(/model/i), 'Model 3')
    await userEvent.type(screen.getByLabelText(/category/i), 'EV')
    await userEvent.type(screen.getByLabelText(/price/i), '50000')
    await userEvent.type(screen.getByLabelText(/^quantity$/i), '2')
    await userEvent.upload(screen.getByLabelText(/vehicle photos/i), files)
    await userEvent.click(
      screen.getByRole('button', { name: /add vehicle/i }),
    )

    expect(uploadsApi.uploadVehicleImage).toHaveBeenCalledTimes(3)
    expect(vehiclesApi.createVehicle).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: 'http://localhost:3000/uploads/front.jpg',
        images: [
          'http://localhost:3000/uploads/interior.jpg',
          'http://localhost:3000/uploads/seats.jpg',
        ],
      }),
    )
  })

  it('shows a success toast after adding a vehicle', async () => {
    vi.mocked(vehiclesApi.createVehicle).mockResolvedValue({
      id: 'v9',
      make: 'Tesla',
      model: 'Model 3',
      category: 'EV',
      price: 50000,
      quantity: 2,
    })
    renderAdmin()
    await screen.findByText(/corolla/i)

    await userEvent.type(screen.getByLabelText(/make/i), 'Tesla')
    await userEvent.type(screen.getByLabelText(/model/i), 'Model 3')
    await userEvent.type(screen.getByLabelText(/category/i), 'EV')
    await userEvent.type(screen.getByLabelText(/price/i), '50000')
    await userEvent.type(screen.getByLabelText(/^quantity$/i), '2')
    await userEvent.click(
      screen.getByRole('button', { name: /add vehicle/i }),
    )

    const toast = await screen.findByRole('status')
    expect(toast).toHaveTextContent(/vehicle added/i)
  })

  it('deletes a vehicle from its row', async () => {
    vi.mocked(vehiclesApi.deleteVehicle).mockResolvedValue(null)
    renderAdmin()
    await screen.findByText(/corolla/i)

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(vehiclesApi.deleteVehicle).toHaveBeenCalledWith('v1')
    await waitFor(() =>
      expect(screen.queryByText(/corolla/i)).not.toBeInTheDocument(),
    )
  })

  it('restocks a vehicle from its row', async () => {
    vi.mocked(vehiclesApi.restockVehicle).mockResolvedValue({
      ...corolla,
      quantity: 8,
    })
    renderAdmin()
    await screen.findByText(/corolla/i)

    await userEvent.type(screen.getByLabelText(/restock quantity/i), '5')
    await userEvent.click(screen.getByRole('button', { name: /restock/i }))

    expect(vehiclesApi.restockVehicle).toHaveBeenCalledWith('v1', 5)
    expect(await screen.findByText('8')).toBeInTheDocument()
  })

  it('edits a vehicle via the form and saves the changes', async () => {
    vi.mocked(vehiclesApi.updateVehicle).mockResolvedValue({
      ...corolla,
      price: 25000,
    })
    renderAdmin()
    await screen.findByText(/corolla/i)

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const priceInput = screen.getByLabelText(/price/i)
    expect(screen.getByLabelText(/make/i)).toHaveValue('Toyota')

    await userEvent.clear(priceInput)
    await userEvent.type(priceInput, '25000')
    await userEvent.click(
      screen.getByRole('button', { name: /save changes/i }),
    )

    expect(vehiclesApi.updateVehicle).toHaveBeenCalledWith(
      'v1',
      expect.objectContaining({ price: 25000 }),
    )
    expect(await screen.findByText('₹25,000')).toBeInTheDocument()
  })
})
