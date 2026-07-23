import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CarFront,
  ShoppingCart,
  Tag,
  Layers,
  PackageCheck,
} from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { Loading } from '../components/Loading'
import { useToast } from '../components/Toast'
import { formatPrice } from '../components/VehicleCard'
import { getVehicle, purchaseVehicle } from '../api/vehicles.api'
import { useAuth } from '../auth/AuthContext'
import type { Vehicle } from '../api/schemas'

/** Full listing view: everyone can look; purchasing needs a login. */
export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!id) return
    getVehicle(id)
      .then(setVehicle)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Failed to load the vehicle',
        ),
      )
  }, [id])

  async function handlePurchase() {
    if (!vehicle) return
    if (!user) {
      navigate('/login')
      return
    }
    setPurchasing(true)
    try {
      const result = await purchaseVehicle(vehicle.id)
      setVehicle(result.vehicle)
      toast.success(`Purchased ${vehicle.make} ${vehicle.model}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  const outOfStock = vehicle?.quantity === 0

  return (
    <AppLayout
      title="Vehicle details"
      subtitle="Everything you need to know before driving it home."
      actions={
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 text-sm font-medium px-4 py-2 transition"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
      }
    >
      {error ? (
        <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
          <CarFront size={32} />
          <p className="text-sm">{error}</p>
        </div>
      ) : vehicle === null ? (
        <Loading label="Loading vehicle…" />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden lg:grid lg:grid-cols-2">
          <div className="relative h-64 lg:h-full min-h-64 bg-gray-100">
            {vehicle.imageUrl && !imgFailed ? (
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <CarFront size={96} strokeWidth={1} />
              </div>
            )}
            <span
              className={`absolute top-4 right-4 text-xs font-semibold rounded-full px-3 py-1 shadow-sm backdrop-blur ${
                outOfStock
                  ? 'bg-red-500/90 text-white'
                  : 'bg-white/90 text-emerald-700'
              }`}
            >
              {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
            </span>
          </div>

          <div className="p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {vehicle.make}
              </p>
              <h2 className="font-display text-3xl font-bold text-gray-900 mt-1 tracking-tight">
                {vehicle.make} {vehicle.model}
              </h2>
              <p className="text-3xl font-bold text-gray-900 mt-4">
                {formatPrice(vehicle.price)}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ex-showroom
                </span>
              </p>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  <Layers size={12} />
                  Category
                </dt>
                <dd className="text-sm font-semibold text-gray-900 mt-1">
                  {vehicle.category}
                </dd>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  <Tag size={12} />
                  Model
                </dt>
                <dd className="text-sm font-semibold text-gray-900 mt-1">
                  {vehicle.model}
                </dd>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  <PackageCheck size={12} />
                  Availability
                </dt>
                <dd className="text-sm font-semibold text-gray-900 mt-1">
                  {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
                </dd>
              </div>
            </dl>

            <div className="mt-auto space-y-2">
              <button
                onClick={handlePurchase}
                disabled={outOfStock || purchasing}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 shadow-sm transition"
              >
                <ShoppingCart size={16} />
                {purchasing ? 'Purchasing…' : 'Purchase'}
              </button>
              <p className="text-center text-[11px] text-gray-400">
                Secure checkout — your purchase appears in My purchases.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
