import { useEffect, useState } from 'react'
import { ShoppingBag, CarFront, Loader2 } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { formatPrice } from '../components/VehicleCard'
import { getMyPurchases } from '../api/users.api'
import type { PurchaseHistoryEntry } from '../api/schemas'

export function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseHistoryEntry[] | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyPurchases()
      .then(setPurchases)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : 'Failed to load purchases',
        ),
      )
  }, [])

  return (
    <AppLayout
      title="My purchases"
      subtitle="Every vehicle you have bought, newest first."
    >
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3"
        >
          {error}
        </p>
      )}

      {purchases === null ? (
        <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
          <ShoppingBag size={32} />
          <p className="text-sm">No purchases yet. Head to the showroom!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {purchases.map((entry) => (
            <li
              key={entry.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4"
            >
              <span className="shrink-0 w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CarFront size={22} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {entry.vehicle
                    ? `${entry.vehicle.make} ${entry.vehicle.model}`
                    : 'Vehicle no longer available'}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(entry.purchasedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(entry.purchasePrice)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  )
}
