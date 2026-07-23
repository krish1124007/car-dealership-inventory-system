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
    <div className="group bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-100/60 hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {vehicle.imageUrl && !imgFailed ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-200">
            <CarFront size={56} strokeWidth={1.25} />
          </div>
        )}

        {/* Soft scrim so the badges stay readable on any photo. */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

        <span
          className={`absolute top-3 right-3 text-[11px] font-semibold rounded-full px-3 py-1 shadow-sm backdrop-blur ${
            outOfStock
              ? 'bg-red-500/95 text-white'
              : 'bg-white/95 text-emerald-700'
          }`}
        >
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>
        <span className="absolute bottom-3 left-3 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-white/20 text-white backdrop-blur-sm border border-white/30">
          {vehicle.category}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-semibold text-gray-900 leading-tight min-w-0 truncate">
            {vehicle.make} {vehicle.model}
          </h3>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-gray-900 tracking-tight">
              {formatPrice(vehicle.price)}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              ex-showroom
            </p>
          </div>
        </div>

        <Link
          to={`/vehicles/${vehicle.id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 shadow-sm transition-colors duration-300"
        >
          <Eye size={16} />
          View car
        </Link>
      </div>
    </div>
  )
}
