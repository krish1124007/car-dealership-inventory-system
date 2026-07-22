import { z } from 'zod'
import { request } from './client'
import { vehicleSchema, purchaseResultSchema } from './schemas'
import type { Vehicle, PurchaseResult } from './schemas'

export interface VehiclePayload {
  make: string
  model: string
  category: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface SearchFilters {
  /** Free-text name search — matches make or model. */
  q?: string
  make?: string
  model?: string
  category?: string
  minPrice?: number
  maxPrice?: number
}

const vehicleListSchema = z.array(vehicleSchema)

/** GET /api/vehicles */
export function listVehicles(): Promise<Vehicle[]> {
  return request('/vehicles', vehicleListSchema)
}

/** GET /api/vehicles/search — only provided filters go into the query. */
export function searchVehicles(filters: SearchFilters): Promise<Vehicle[]> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }
  return request(`/vehicles/search?${params.toString()}`, vehicleListSchema)
}

/** GET /api/vehicles/:id */
export function getVehicle(id: string): Promise<Vehicle> {
  return request(`/vehicles/${id}`, vehicleSchema)
}

/** POST /api/vehicles (admin) */
export function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  return request('/vehicles', vehicleSchema, { method: 'POST', body: payload })
}

/** PUT /api/vehicles/:id (admin) */
export function updateVehicle(
  id: string,
  changes: Partial<VehiclePayload>,
): Promise<Vehicle> {
  return request(`/vehicles/${id}`, vehicleSchema, {
    method: 'PUT',
    body: changes,
  })
}

/** DELETE /api/vehicles/:id (admin) */
export function deleteVehicle(id: string): Promise<null> {
  return request(`/vehicles/${id}`, z.null(), { method: 'DELETE' })
}

/** POST /api/vehicles/:id/purchase */
export function purchaseVehicle(id: string): Promise<PurchaseResult> {
  return request(`/vehicles/${id}/purchase`, purchaseResultSchema, {
    method: 'POST',
  })
}

/** POST /api/vehicles/:id/restock (admin) */
export function restockVehicle(id: string, quantity: number): Promise<Vehicle> {
  return request(`/vehicles/${id}/restock`, vehicleSchema, {
    method: 'POST',
    body: { quantity },
  })
}
