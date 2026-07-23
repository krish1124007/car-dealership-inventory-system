import { useEffect, useState } from 'react'
import { AppLayout } from '../components/AppLayout'
import { BannerCarousel } from '../components/BannerCarousel'
import { Loading } from '../components/Loading'
import { VehicleCard } from '../components/VehicleCard'
import { useToast } from '../components/Toast'
import { listVehicles } from '../api/vehicles.api'
import type { Vehicle } from '../api/schemas'

/** Public landing page: promotional banners above the full inventory. */
export function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
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

  return (
    <AppLayout>
      <BannerCarousel />

      <div className="flex items-end justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Our cars
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse the full inventory and drive one home today.
          </p>
        </div>
        {vehicles !== null && (
          <p className="text-sm font-semibold text-gray-900">
            {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'}{' '}
            available
          </p>
        )}
      </div>

      {vehicles === null ? (
        <Loading label="Loading vehicles…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
