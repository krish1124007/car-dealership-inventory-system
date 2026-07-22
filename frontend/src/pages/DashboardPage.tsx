import { useEffect, useState } from 'react'
import { SearchX } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { FilterSidebar } from '../components/FilterSidebar'
import { Loading } from '../components/Loading'
import { VehicleCard } from '../components/VehicleCard'
import { useToast } from '../components/Toast'
import {
  listVehicles,
  searchVehicles,
  purchaseVehicle,
} from '../api/vehicles.api'
import type { SearchFilters } from '../api/vehicles.api'
import type { Vehicle } from '../api/schemas'

export function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const toast = useToast()

  async function loadAll() {
    try {
      const list = await listVehicles()
      setVehicles(list)
      setCategories([...new Set(list.map((v) => v.category))])
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load vehicles',
      )
    }
  }

  useEffect(() => {
    void loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(filters: SearchFilters) {
    try {
      const results =
        Object.keys(filters).length > 0
          ? await searchVehicles(filters)
          : await listVehicles()
      setVehicles(results)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Search failed')
    }
  }

  async function handlePurchase(vehicle: Vehicle) {
    try {
      const result = await purchaseVehicle(vehicle.id)
      setVehicles((prev) =>
        prev
          ? prev.map((v) => (v.id === result.vehicle.id ? result.vehicle : v))
          : prev,
      )
      toast.success(`Purchased ${vehicle.make} ${vehicle.model}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Purchase failed')
    }
  }

  return (
    <AppLayout
      title="Home"
      subtitle="Browse the inventory and drive one home today."
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <FilterSidebar
          categories={categories}
          onSearch={handleSearch}
          onReset={loadAll}
        />

        <div className="flex-1 w-full space-y-4">
          {vehicles !== null && (
            <p className="text-sm font-semibold text-gray-900">
              {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'}{' '}
              available
            </p>
          )}

          {vehicles === null ? (
            <Loading label="Loading vehicles…" />
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
              <SearchX size={32} />
              <p className="text-sm">
                No vehicles found. Try different filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
