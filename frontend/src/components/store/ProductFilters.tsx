'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { CATEGORIES, SORT_OPTIONS } from '@/lib/utils'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = {
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
  }

  const hasFilters = current.category || current.minPrice || current.maxPrice || current.sort !== 'newest'

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;['category', 'minPrice', 'maxPrice', 'sort'].forEach((k) => params.delete(k))
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-slate-900">Filters</h3>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mb-6">
        <label className="label">Sort by</label>
        <div className="relative">
          <select
            value={current.sort}
            onChange={(e) => update('sort', e.target.value)}
            className="input-base appearance-none pr-9 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="label">Category</label>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => update('category', '')}
            className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              !current.category
                ? 'bg-brand-600 text-white shadow-brand'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => update('category', cat === current.category ? '' : cat)}
              className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                current.category === cat
                  ? 'bg-brand-600 text-white shadow-brand'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="label">Price Range (£)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={current.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
            className="input-base w-full"
          />
          <span className="text-slate-400 flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={current.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
            className="input-base w-full"
          />
        </div>
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {[
            { label: 'Under £25', min: '', max: '25' },
            { label: '£25–£50', min: '25', max: '50' },
            { label: '£50–£100', min: '50', max: '100' },
            { label: 'Over £100', min: '100', max: '' },
          ].map((preset) => {
            const active = current.minPrice === preset.min && current.maxPrice === preset.max
            return (
              <button
                key={preset.label}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (active) {
                    params.delete('minPrice')
                    params.delete('maxPrice')
                  } else {
                    if (preset.min) params.set('minPrice', preset.min)
                    else params.delete('minPrice')
                    if (preset.max) params.set('maxPrice', preset.max)
                    else params.delete('maxPrice')
                  }
                  params.set('page', '1')
                  router.push(`${pathname}?${params.toString()}`, { scroll: false })
                }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-150 border ${
                  active
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      {hasFilters && (
        <Button variant="secondary" className="w-full" onClick={clearAll}>
          <X className="h-4 w-4" />
          Reset Filters
        </Button>
      )}
    </aside>
  )
}
