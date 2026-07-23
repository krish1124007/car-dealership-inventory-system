import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CarFront, Eye, LogIn } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import type { Vehicle } from '../api/schemas'

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`
}

/** Listing card in the classifieds style: white pill badges over the
 * photo, name and price beneath, and an outlined View car action. */
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { user } = useAuth()
  const outOfStock = vehicle.quantity === 0
  // Broken image urls fall back to the placeholder instead of a broken icon.
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col">
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

        {/* Availability pill, classifieds style. */}
        <span
          className={`absolute top-3 left-3 rounded-full bg-white/95 border border-gray-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${
            outOfStock ? 'text-red-600' : 'text-gray-900'
          }`}
        >
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>

        {/* Category pill with icon. */}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
          <CarFront size={12} />
          {vehicle.category}
        </span>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-2.5 flex-1">
        <h3 className="font-display text-lg font-bold text-gray-900 leading-tight truncate">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-lg font-bold text-gray-900">
          {formatPrice(vehicle.price)}
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            ex-showroom
          </span>
        </p>

        {/* Signed-out visitors are sent to log in rather than to a page the
            card implies they can already open. */}
        <Link
          to={user ? `/vehicles/${vehicle.id}` : '/login'}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-onaccent text-sm font-bold py-2.5 transition-colors duration-300"
        >
          {user ? (
            <>
              <Eye size={16} />
              View car
            </>
          ) : (
            <>
              <LogIn size={16} />
              Login to view
            </>
          )}
        </Link>
      </div>
    </div>
  )
}
