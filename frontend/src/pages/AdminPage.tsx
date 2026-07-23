import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  CarFront,
  Pencil,
  Trash2,
  PackagePlus,
  Warehouse,
  Users,
  Inbox,
} from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { AdminUsersPanel } from '../components/AdminUsersPanel'
import { AdminMessagesPanel } from '../components/AdminMessagesPanel'
import { Loading } from '../components/Loading'
import { useToast } from '../components/Toast'
import { formatPrice } from '../components/VehicleCard'
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  restockVehicle,
} from '../api/vehicles.api'
import { uploadVehicleImage } from '../api/uploads.api'
import type { Vehicle, FuelType } from '../api/schemas'

const fieldClasses =
  'w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition'

const fuelLabels: Record<FuelType, string> = {
  PETROL: 'Petrol',
  DIESEL: 'Diesel',
  ELECTRIC: 'Electric',
}

const emptyForm = {
  make: '',
  model: '',
  category: '',
  fuelType: 'PETROL',
  price: '',
  quantity: '',
}

/** Sidebar sections — one is open at a time, so nothing needs scrolling past. */
const sections = [
  {
    key: 'inventory' as const,
    label: 'Inventory',
    icon: <Warehouse size={16} />,
    title: 'Inventory management',
    subtitle: 'Add, edit, restock or remove vehicles from the showroom.',
  },
  {
    key: 'users' as const,
    label: 'Users',
    icon: <Users size={16} />,
    title: 'Registered users',
    subtitle: 'Everyone with an account, and when they last signed in.',
  },
  {
    key: 'messages' as const,
    label: 'Messages',
    icon: <Inbox size={16} />,
    title: 'Messages from visitors',
    subtitle: 'Enquiries sent through the public contact form.',
  },
]

type SectionKey = (typeof sections)[number]['key']

export function AdminPage() {
  const [section, setSection] = useState<SectionKey>('inventory')
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [preLaunch, setPreLaunch] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [restockAmounts, setRestockAmounts] = useState<Record<string, string>>(
    {},
  )
  const toast = useToast()

  useEffect(() => {
    listVehicles()
      .then(setVehicles)
      .catch((err) =>
        toast.error(
          err instanceof Error ? err.message : 'Failed to load vehicles',
        ),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      fuelType: vehicle.fuelType ?? 'PETROL',
      price: String(vehicle.price),
      quantity: String(vehicle.quantity),
    })
    setPreLaunch(vehicle.preLaunch ?? false)
    setImageFiles([])
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setPreLaunch(false)
    setImageFiles([])
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      // The first photo becomes the main image; the rest fill the gallery.
      const urls: string[] = []
      for (const file of imageFiles) {
        urls.push((await uploadVehicleImage(file)).url)
      }
      const payload = {
        make: form.make.trim(),
        model: form.model.trim(),
        category: form.category.trim(),
        fuelType: form.fuelType as FuelType,
        preLaunch,
        price: Number(form.price),
        quantity: Number(form.quantity || 0),
        ...(urls.length > 0 && { imageUrl: urls[0], images: urls.slice(1) }),
      }
      if (editingId) {
        const updated = await updateVehicle(editingId, payload)
        setVehicles((prev) =>
          prev ? prev.map((v) => (v.id === updated.id ? updated : v)) : prev,
        )
        toast.success('Vehicle updated')
      } else {
        const created = await createVehicle(payload)
        setVehicles((prev) => (prev ? [...prev, created] : [created]))
        toast.success('Vehicle added')
      }
      cancelEdit()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Saving failed')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteVehicle(id)
      setVehicles((prev) => (prev ? prev.filter((v) => v.id !== id) : prev))
      toast.success('Vehicle deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleRestock(id: string) {
    const amount = Number(restockAmounts[id])
    try {
      const updated = await restockVehicle(id, amount)
      setVehicles((prev) =>
        prev ? prev.map((v) => (v.id === updated.id ? updated : v)) : prev,
      )
      setRestockAmounts((prev) => ({ ...prev, [id]: '' }))
      toast.success('Stock updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Restock failed')
    }
  }

  const openSection = sections.find((s) => s.key === section)!

  return (
    <AppLayout title={openSection.title} subtitle={openSection.subtitle}>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <nav
          aria-label="Admin sections"
          className="w-full lg:w-56 shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm p-2 flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-24"
        >
          {sections.map((item) => {
            const active = item.key === section
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSection(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="flex-1 w-full min-w-0 space-y-6">
          {section === 'users' && <AdminUsersPanel />}
          {section === 'messages' && <AdminMessagesPanel />}
          {section === 'inventory' && (
            <>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="font-semibold text-gray-900">
            {editingId ? 'Edit vehicle' : 'Add a vehicle'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {editingId
              ? 'Update the listing details and save your changes.'
              : 'Fill in the listing details to publish it in the showroom.'}
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
          <div>
            <label
              htmlFor="admin-make"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Make
            </label>
            <input
              id="admin-make"
              required
              placeholder="e.g. Toyota"
              className={fieldClasses}
              value={form.make}
              onChange={(e) => setField('make', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-model"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Model
            </label>
            <input
              id="admin-model"
              required
              placeholder="e.g. Fortuner"
              className={fieldClasses}
              value={form.model}
              onChange={(e) => setField('model', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-category"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Category
            </label>
            <input
              id="admin-category"
              required
              placeholder="e.g. SUV"
              className={fieldClasses}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-fuel-type"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Fuel type
            </label>
            <select
              id="admin-fuel-type"
              className={fieldClasses}
              value={form.fuelType}
              onChange={(e) => setField('fuelType', e.target.value)}
            >
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="admin-price"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Price
            </label>
            <input
              id="admin-price"
              type="number"
              required
              min="1"
              placeholder="45000"
              className={fieldClasses}
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-quantity"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Quantity
            </label>
            <input
              id="admin-quantity"
              type="number"
              min="0"
              placeholder="5"
              className={fieldClasses}
              value={form.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="admin-image"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Vehicle photos{' '}
              <span className="text-gray-400 font-normal">
                (optional — first is the main photo, the rest become the
                gallery)
              </span>
            </label>
            <input
              id="admin-image"
              type="file"
              accept="image/*"
              multiple
              className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
              onChange={(e) => setImageFiles([...(e.target.files ?? [])])}
            />
            {imageFiles.length > 1 && (
              <p className="text-xs text-gray-400 mt-1">
                {imageFiles.length} photos selected
              </p>
            )}
          </div>
          <label
            htmlFor="admin-pre-launch"
            className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer sm:col-span-2 lg:col-span-3"
          >
            <input
              id="admin-pre-launch"
              type="checkbox"
              checked={preLaunch}
              onChange={(e) => setPreLaunch(e.target.checked)}
              className="accent-blue-600 w-4 h-4"
            />
            Pre-launch listing
            <span className="text-gray-400 font-normal">
              (shown under the Pre-launch cars collection)
            </span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 text-sm font-medium px-6 py-2.5 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 shadow-sm transition"
          >
            {editingId ? 'Save changes' : 'Add vehicle'}
          </button>
        </div>
      </form>

      {vehicles === null ? (
        <Loading />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Fuel</th>
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
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt=""
                          className="w-12 h-9 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <span className="w-12 h-9 rounded-lg bg-gray-100 text-gray-300 flex items-center justify-center">
                          <CarFront size={18} />
                        </span>
                      )}
                      <span className="font-medium text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {vehicle.category}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      {fuelLabels[vehicle.fuelType ?? 'PETROL']}
                      {vehicle.preLaunch && (
                        <span className="rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold px-2 py-0.5">
                          Pre-launch
                        </span>
                      )}
                    </span>
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
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
