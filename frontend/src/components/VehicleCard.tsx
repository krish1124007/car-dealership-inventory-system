import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CarFront, Eye } from 'lucide-react'
import type { Vehicle } from '../api/schemas'

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`
}

/** Listing card: photo with stock/category badges and a View car link
 * that opens the vehicle detail page. */
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const outOfStock = vehicle.quantity === 0
  // Broken image urls fall back to the placeholder instead of a broken icon.
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition flex flex-col">
      <div className="relative h-44 bg-gray-100">
        {vehicle.imageUrl && !imgFailed ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <CarFront size={56} strokeWidth={1.25} />
          </div>
        )}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold rounded-full px-3 py-1 shadow-sm backdrop-blur ${
            outOfStock
              ? 'bg-red-500/90 text-white'
              : 'bg-white/90 text-emerald-700'
          }`}
        >
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>
        <span className="absolute bottom-3 left-3 text-xs font-medium rounded-full px-3 py-1 bg-gray-900/70 text-white backdrop-blur">
          {vehicle.category}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-900 leading-tight">
            {vehicle.make} {vehicle.model}
          </h3>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(vehicle.price)}
            </p>
            <p className="text-[11px] text-gray-400">ex-showroom</p>
          </div>
        </div>

        <Link
          to={`/vehicles/${vehicle.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 transition"
        >
          <Eye size={16} />
          View car
        </Link>
      </div>
    </div>
  )
}
