import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  listVehicles,
  searchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from './vehicles.api'
import { setToken } from './client'
import { mockFetchOnce, firstCall } from '../tests/mockFetch'

const vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 20000,
  quantity: 5,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('listVehicles', () => {
  it('GETs /vehicles with the stored token', async () => {
    setToken('jwt-token')
    const fetchMock = mockFetchOnce([vehicle])

    const result = await listVehicles()

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/vehicles')
    expect((init.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer jwt-token',
    )
    expect(result).toHaveLength(1)
    expect(result[0].make).toBe('Toyota')
  })
})

describe('searchVehicles', () => {
  it('includes only the provided filters in the query string', async () => {
    const fetchMock = mockFetchOnce([vehicle])

    await searchVehicles({ make: 'Toyota', minPrice: 10000 })

    const [url] = firstCall(fetchMock)
    expect(url).toContain('/vehicles/search?')
    expect(url).toContain('make=Toyota')
    expect(url).toContain('minPrice=10000')
    expect(url).not.toContain('model=')
    expect(url).not.toContain('maxPrice=')
  })

  it('returns the matching vehicles', async () => {
    mockFetchOnce([vehicle])

    const result = await searchVehicles({ category: 'Sedan' })

    expect(result[0].category).toBe('Sedan')
  })
})

describe('createVehicle', () => {
  it('POSTs the vehicle payload to /vehicles', async () => {
    const fetchMock = mockFetchOnce(vehicle, { status: 201 })

    const result = await createVehicle({
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 20000,
      quantity: 5,
    })

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/vehicles')
    expect(init.method).toBe('POST')
    expect(result.id).toBe('v1')
  })
})

describe('updateVehicle', () => {
  it('PUTs the changes to /vehicles/:id', async () => {
    const fetchMock = mockFetchOnce({ ...vehicle, price: 22000 })

    const result = await updateVehicle('v1', { price: 22000 })

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/vehicles/v1')
    expect(init.method).toBe('PUT')
    expect(result.price).toBe(22000)
  })
})

describe('deleteVehicle', () => {
  it('DELETEs /vehicles/:id', async () => {
    const fetchMock = mockFetchOnce(null)

    await deleteVehicle('v1')

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/vehicles/v1')
    expect(init.method).toBe('DELETE')
  })
})

describe('purchaseVehicle', () => {
  it('POSTs to /vehicles/:id/purchase and returns vehicle plus purchase', async () => {
    const fetchMock = mockFetchOnce({
      vehicle: { ...vehicle, quantity: 4 },
      purchase: {
        id: 'p1',
        quantity: 1,
        purchasePrice: 20000,
        purchasedAt: '2026-07-22T10:00:00.000Z',
      },
    })

    const result = await purchaseVehicle('v1')

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/vehicles/v1/purchase')
    expect(init.method).toBe('POST')
    expect(result.vehicle.quantity).toBe(4)
    expect(result.purchase.purchasePrice).toBe(20000)
  })
})

describe('restockVehicle', () => {
  it('POSTs the quantity to /vehicles/:id/restock', async () => {
    const fetchMock = mockFetchOnce({ ...vehicle, quantity: 10 })

    const result = await restockVehicle('v1', 5)

    const [url, init] = firstCall(fetchMock)
    expect(url).toContain('/vehicles/v1/restock')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ quantity: 5 })
    expect(result.quantity).toBe(10)
  })
})
