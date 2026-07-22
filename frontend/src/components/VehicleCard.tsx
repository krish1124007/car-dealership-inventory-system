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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="inline-block mt-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">
            {vehicle.category}
          </span>
        </div>
        <span className="text-lg font-bold text-blue-600">
          {formatPrice(vehicle.price)}
        </span>
      </div>

      <p
        className={`text-sm ${outOfStock ? 'text-red-500' : 'text-gray-500'}`}
      >
        {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
      </p>

      <button
        onClick={() => onPurchase(vehicle)}
        disabled={outOfStock}
        className="mt-auto rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 transition"
      >
        Purchase
      </button>
    </div>
  )
}
