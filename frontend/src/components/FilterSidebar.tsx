import { useState } from 'react'
import type { FormEvent } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import type { SearchFilters } from '../api/vehicles.api'

const fieldClasses =
  'w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition'

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
      {children}
    </p>
  )
}

/** Left filter panel in the professional dealer style. */
export function FilterSidebar({
  categories,
  onSearch,
  onReset,
}: {
  categories: string[]
  onSearch: (filters: SearchFilters) => void
  onReset: () => void
}) {
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const filters: SearchFilters = {}
    if (make.trim()) filters.make = make.trim()
    if (model.trim()) filters.model = model.trim()
    if (category) filters.category = category
    if (minPrice.trim()) filters.minPrice = Number(minPrice)
    if (maxPrice.trim()) filters.maxPrice = Number(maxPrice)
    onSearch(filters)
  }

  function handleReset() {
    setMake('')
    setModel('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    onReset()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full lg:w-64 shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-6 lg:sticky lg:top-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Filter by:</h2>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-500 transition"
        >
          <RotateCcw size={11} />
          Reset all
        </button>
      </div>

      <div className="space-y-3">
        <SectionTitle>Search</SectionTitle>
        <div>
          <label htmlFor="filter-make" className="sr-only">
            Make
          </label>
          <input
            id="filter-make"
            placeholder="Make (e.g. Toyota)"
            className={fieldClasses}
            value={make}
            onChange={(e) => setMake(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filter-model" className="sr-only">
            Model
          </label>
          <input
            id="filter-model"
            placeholder="Model (e.g. Corolla)"
            className={fieldClasses}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <SectionTitle>Category</SectionTitle>
          <div className="space-y-2">
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="filter-min"
              className="block text-[11px] text-gray-400 mb-1"
            >
              Min price
            </label>
            <input
              id="filter-min"
              type="number"
              min="0"
              placeholder="From"
              className={fieldClasses}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="filter-max"
              className="block text-[11px] text-gray-400 mb-1"
            >
              Max price
            </label>
            <input
              id="filter-max"
              type="number"
              min="0"
              placeholder="To"
              className={fieldClasses}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 shadow-sm transition"
      >
        <Search size={15} />
        Search
      </button>
    </form>
  )
}
