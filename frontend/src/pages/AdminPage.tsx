import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Pencil, Trash2, PackagePlus } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { formatPrice } from '../components/VehicleCard'
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  restockVehicle,
} from '../api/vehicles.api'
import type { Vehicle } from '../api/schemas'

const fieldClasses =
  'w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition'

const emptyForm = { make: '', model: '', category: '', price: '', quantity: '' }

export function AdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [restockAmounts, setRestockAmounts] = useState<Record<string, string>>(
    {},
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listVehicles()
      .then(setVehicles)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Failed to load vehicles',
        ),
      )
  }, [])

  function setField(key: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id)
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: String(vehicle.price),
      quantity: String(vehicle.quantity),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity || 0),
    }
    try {
      if (editingId) {
        const updated = await updateVehicle(editingId, payload)
        setVehicles((prev) =>
          prev ? prev.map((v) => (v.id === updated.id ? updated : v)) : prev,
        )
      } else {
        const created = await createVehicle(payload)
        setVehicles((prev) => (prev ? [...prev, created] : [created]))
      }
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed')
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteVehicle(id)
      setVehicles((prev) => (prev ? prev.filter((v) => v.id !== id) : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleRestock(id: string) {
    setError(null)
    const amount = Number(restockAmounts[id])
    try {
      const updated = await restockVehicle(id, amount)
      setVehicles((prev) =>
        prev ? prev.map((v) => (v.id === updated.id ? updated : v)) : prev,
      )
      setRestockAmounts((prev) => ({ ...prev, [id]: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restock failed')
    }
  }

  return (
    <AppLayout
      title="Inventory management"
      subtitle="Add, edit, restock or remove vehicles from the showroom."
    >
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <h2 className="font-semibold text-gray-900">
          {editingId ? 'Edit vehicle' : 'Add a vehicle'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label
              htmlFor="admin-make"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Make
            </label>
            <input
              id="admin-make"
              required
              className={fieldClasses}
              value={form.make}
              onChange={(e) => setField('make', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-model"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Model
            </label>
            <input
              id="admin-model"
              required
              className={fieldClasses}
              value={form.model}
              onChange={(e) => setField('model', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-category"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Category
            </label>
            <input
              id="admin-category"
              required
              className={fieldClasses}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-price"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Price
            </label>
            <input
              id="admin-price"
              type="number"
              required
              min="1"
              className={fieldClasses}
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-quantity"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Quantity
            </label>
            <input
              id="admin-quantity"
              type="number"
              min="0"
              className={fieldClasses}
              value={form.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 transition"
          >
            {editingId ? 'Save changes' : 'Add vehicle'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 text-sm font-medium px-6 py-2.5 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {vehicles === null ? (
        <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Restock</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {vehicle.category}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    {formatPrice(vehicle.price)}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {vehicle.quantity}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        aria-label="Restock quantity"
                        placeholder="Qty"
                        className="w-20 rounded-lg bg-white border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={restockAmounts[vehicle.id] ?? ''}
                        onChange={(e) =>
                          setRestockAmounts((prev) => ({
                            ...prev,
                            [vehicle.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleRestock(vehicle.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 transition"
                      >
                        <PackagePlus size={14} />
                        Restock
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(vehicle)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 text-xs font-medium px-3 py-1.5 transition"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium px-3 py-1.5 transition"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}
