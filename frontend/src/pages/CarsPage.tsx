import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { Loading } from '../components/Loading'
import { VehicleCard } from '../components/VehicleCard'
import { useToast } from '../components/Toast'
import { formatPrice } from '../components/VehicleCard'
import { listVehicles, searchVehicles } from '../api/vehicles.api'
import type { SearchFilters } from '../api/vehicles.api'
import type { Vehicle } from '../api/schemas'

const fieldClasses =
  'w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition'

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
      {children}
    </p>
  )
}

/** All-cars page: filter sidebar on the left, inventory grid on the right.
 * Honours a ?q= query coming from the navbar search. */
export function CarsPage() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''

  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [query, setQuery] = useState(urlQuery)
  const [category, setCategory] = useState('')
  // Price slider: cap is the highest inventory price; limit is the chosen
  // upper bound (no filter while it sits at the cap).
  const [priceCap, setPriceCap] = useState<number | null>(null)
  const [priceLimit, setPriceLimit] = useState<number | null>(null)
  const toast = useToast()

  async function runSearch(filters: SearchFilters) {
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

  // Categories and the price cap always come from the full inventory.
  useEffect(() => {
    listVehicles()
      .then((list) => {
        setCategories([...new Set(list.map((v) => v.category))])
        if (list.length > 0) {
          const cap = Math.max(...list.map((v) => v.price))
          setPriceCap(cap)
          setPriceLimit((prev) => prev ?? cap)
        }
      })
      .catch(() => {})
  }, [])

  // Keep the local search box in sync with the navbar-provided ?q=.
  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  // Auto-apply: any filter change re-runs the search after a short debounce
  // (no Apply button needed).
  useEffect(() => {
    const timer = setTimeout(() => {
      void runSearch(buildFilters())
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, priceLimit, priceCap])

  function buildFilters(): SearchFilters {
    const filters: SearchFilters = {}
    if (query.trim()) filters.q = query.trim()
    if (category) filters.category = category
    if (
      priceCap !== null &&
      priceLimit !== null &&
      priceLimit < priceCap
    ) {
      filters.maxPrice = priceLimit
    }
    return filters
  }

  function handleReset() {
    setQuery('')
    setCategory('')
    setPriceLimit(priceCap)
  }

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full lg:w-64 shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-6 lg:sticky lg:top-24"
        >
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <SlidersHorizontal size={14} />
              Filters
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-500 transition"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          </div>

          <div>
            <SectionTitle>Search by name</SectionTitle>
            <label htmlFor="cars-search" className="sr-only">
              Search by name
            </label>
            <input
              id="cars-search"
              type="search"
              placeholder="e.g. Corolla, Tesla…"
              className={fieldClasses}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {categories.length > 0 && (
            <div>
              <SectionTitle>Category</SectionTitle>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={category === ''}
                    onChange={() => setCategory('')}
                    className="accent-blue-600 w-3.5 h-3.5"
                  />
                  All
                </label>
                {categories.map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c}
                      checked={category === c}
                      onChange={() => setCategory(c)}
                      className="accent-blue-600 w-3.5 h-3.5"
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionTitle>Price range</SectionTitle>
            <label htmlFor="cars-price" className="sr-only">
              Price range
            </label>
            <input
              id="cars-price"
              type="range"
              min={0}
              max={priceCap ?? 0}
              step={1000}
              disabled={priceCap === null}
              value={priceLimit ?? 0}
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>₹0</span>
              <span>{priceCap !== null ? formatPrice(priceCap) : '—'}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-2">
              Up to {priceLimit !== null ? formatPrice(priceLimit) : '…'}
            </p>
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            Filters apply automatically.
          </p>
        </form>

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
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
