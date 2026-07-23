import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, CarFront, BadgeCheck } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { Loading } from '../components/Loading'
import { useToast } from '../components/Toast'
import { formatPrice } from '../components/VehicleCard'
import { getMyPurchases } from '../api/users.api'
import type { PurchaseHistoryEntry } from '../api/schemas'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function PurchaseEntry({ entry }: { entry: PurchaseHistoryEntry }) {
  const vehicle = entry.vehicle

  return (
    <li className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition">
      {/* Photo */}
      <div className="shrink-0 w-full sm:w-36 h-36 sm:h-24 rounded-xl overflow-hidden bg-gray-100">
        {vehicle?.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <CarFront size={36} strokeWidth={1.25} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        {vehicle ? (
          <Link
            to={`/vehicles/${vehicle.id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 transition truncate block"
          >
            {vehicle.make} {vehicle.model}
          </Link>
        ) : (
          <p className="font-semibold text-gray-500">
            Vehicle no longer available
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {vehicle && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">
              {vehicle.category}
            </span>
          )}
          <span className="text-xs text-gray-400">
            Purchased on {formatDate(entry.purchasedAt)}
          </span>
          <span className="text-xs text-gray-400">
            · Qty {entry.quantity}
          </span>
        </div>
      </div>

      {/* Price paid */}
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold text-gray-900">
          {formatPrice(entry.purchasePrice)}
        </p>
        <p className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <BadgeCheck size={12} />
          Paid
        </p>
      </div>
    </li>
  )
}

export function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseHistoryEntry[] | null>(
    null,
  )
  const toast = useToast()

  useEffect(() => {
    getMyPurchases()
      .then(setPurchases)
      .catch((err) =>
        toast.error(
          err instanceof Error ? err.message : 'Failed to load purchases',
        ),
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppLayout
      title="My purchases"
      subtitle="Every vehicle you have bought, newest first."
    >
      {purchases === null ? (
        <Loading />
      ) : purchases.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
          <ShoppingBag size={32} />
          <p className="text-sm">No purchases yet. Head to the showroom!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {purchases.map((entry) => (
            <PurchaseEntry key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </AppLayout>
  )
}
