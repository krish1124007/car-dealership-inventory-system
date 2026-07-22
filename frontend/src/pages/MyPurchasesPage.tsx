import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My purchases</h1>
          <p className="text-gray-500 mt-1">
            Every vehicle you have bought, newest first.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3"
          >
            {error}
          </p>
        )}

        {purchases === null ? (
          <p className="text-gray-400 text-center py-16">Loading…</p>
        ) : purchases.length === 0 ? (
          <p className="text-gray-400 text-center py-16">
            No purchases yet. Head to the showroom!
          </p>
        ) : (
          <ul className="space-y-3">
            {purchases.map((entry) => (
              <li
                key={entry.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
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
                <span className="text-lg font-bold text-emerald-600">
                  {formatPrice(entry.purchasePrice)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
