import { CarFront, ShoppingCart } from 'lucide-react'
import type { Vehicle } from '../api/schemas'

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US')}`
}

export function VehicleCard({
  vehicle,
  onPurchase,
}: {
  vehicle: Vehicle
  onPurchase: (vehicle: Vehicle) => void
}) {
  const outOfStock = vehicle.quantity === 0

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <CarFront size={22} />
        </span>
        <span
          className={`text-xs font-medium rounded-full px-2.5 py-1 ${
            outOfStock
              ? 'bg-red-50 text-red-600'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">{vehicle.category}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(vehicle.price)}
        </span>
        <button
          onClick={() => onPurchase(vehicle)}
          disabled={outOfStock}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition"
        >
          <ShoppingCart size={16} />
          Purchase
        </button>
      </div>
    </div>
  )
}
