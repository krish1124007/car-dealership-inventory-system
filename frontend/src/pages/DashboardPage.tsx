import { useEffect, useState } from 'react'
import { SearchX, Loader2 } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { SearchBar } from '../components/SearchBar'
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
  const toast = useToast()

  async function loadAll() {
    try {
      setVehicles(await listVehicles())
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
      title="Showroom"
      subtitle="Browse the inventory and drive one home today."
    >
      <SearchBar onSearch={handleSearch} onReset={loadAll} />

      {vehicles === null ? (
        <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Loading vehicles…</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
          <SearchX size={32} />
          <p className="text-sm">No vehicles found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
