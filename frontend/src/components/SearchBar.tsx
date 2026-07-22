import { useState } from 'react'
import type { FormEvent } from 'react'
import type { SearchFilters } from '../api/vehicles.api'

const fieldClasses =
  'w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition'

export function SearchBar({
  onSearch,
  onReset,
}: {
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
    if (category.trim()) filters.category = category.trim()
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
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-6 gap-3 items-end"
    >
      <div>
        <label htmlFor="search-make" className="block text-xs text-gray-500 mb-1">
          Make
        </label>
        <input
          id="search-make"
          className={fieldClasses}
          placeholder="Toyota"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="search-model" className="block text-xs text-gray-500 mb-1">
          Model
        </label>
        <input
          id="search-model"
          className={fieldClasses}
          placeholder="Corolla"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="search-category" className="block text-xs text-gray-500 mb-1">
          Category
        </label>
        <input
          id="search-category"
          className={fieldClasses}
          placeholder="SUV"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="search-min" className="block text-xs text-gray-500 mb-1">
          Min price
        </label>
        <input
          id="search-min"
          type="number"
          min="0"
          className={fieldClasses}
          placeholder="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="search-max" className="block text-xs text-gray-500 mb-1">
          Max price
        </label>
        <input
          id="search-max"
          type="number"
          min="0"
          className={fieldClasses}
          placeholder="100000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 transition"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 rounded-full border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 text-sm font-medium py-2 transition"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
