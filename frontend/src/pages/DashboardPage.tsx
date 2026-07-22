import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Search, SearchX, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
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

const fieldClasses =
  'rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition'

export function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
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

  async function handleApply(event: FormEvent) {
    event.preventDefault()
    const filters: SearchFilters = {}
    if (query.trim()) filters.q = query.trim()
    if (category) filters.category = category
    if (minPrice.trim()) filters.minPrice = Number(minPrice)
    if (maxPrice.trim()) filters.maxPrice = Number(maxPrice)

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

  function handleReset() {
    setQuery('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    void loadAll()
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
      <form onSubmit={handleApply} className="space-y-3">
        {/* Top search bar: free-text car name search. */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <label htmlFor="vehicle-search" className="sr-only">
              Search
            </label>
            <input
              id="vehicle-search"
              type="search"
              placeholder="Search cars by name — e.g. Corolla, Toyota…"
              className="w-full rounded-xl bg-white border border-gray-200 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 shadow-sm transition"
          >
            <Search size={15} />
            Search
          </button>
        </div>

        {/* Filter bar: everything else in one row. */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <SlidersHorizontal size={13} />
            Filters
          </span>
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-category"
              className="text-xs text-gray-500"
            >
              Category
            </label>
            <select
              id="filter-category"
              className={fieldClasses}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-min" className="text-xs text-gray-500">
              Min price
            </label>
            <input
              id="filter-min"
              type="number"
              min="0"
              placeholder="From"
              className={`${fieldClasses} w-28`}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-max" className="text-xs text-gray-500">
              Max price
            </label>
            <input
              id="filter-max"
              type="number"
              min="0"
              placeholder="To"
              className={`${fieldClasses} w-28`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 text-sm font-medium px-4 py-2 transition"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </form>

      {vehicles !== null && (
        <p className="text-sm font-semibold text-gray-900">
          {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} available
        </p>
      )}

      {vehicles === null ? (
        <Loading label="Loading vehicles…" />
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-gray-400 py-20">
          <SearchX size={32} />
          <p className="text-sm">No vehicles found. Try different filters.</p>
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
    </AppLayout>
  )
}
