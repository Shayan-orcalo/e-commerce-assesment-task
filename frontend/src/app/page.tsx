'use client'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { api } from '@/lib/api'
import { Product, PaginatedResponse } from '@/types'
import ProductCard from '@/components/store/ProductCard'
import ProductFilters from '@/components/store/ProductFilters'
import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import { Spinner } from '@/components/ui/Spinner'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Package, Search } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const LIMIT = 12

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const params = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page') || 1),
    limit: LIMIT,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Product>>('/products', { params })
      return res.data
    },
    placeholderData: keepPreviousData,
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0

  const setPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('page', String(p))
    router.push(`${pathname}?${sp.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-16 min-h-screen bg-slate-50">
        <div className="page-container py-8">
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 p-8 md:p-12">
            <div className="relative z-10">
              <p className="text-brand-200 font-medium text-sm mb-2 tracking-wide uppercase">New Season Arrivals</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                Discover Premium<br />Products
              </h1>
              <p className="text-brand-100 text-lg max-w-md">
                Shop our curated collection of top-quality items at unbeatable prices.
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none">
              <div className="absolute right-8 top-8 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute right-24 bottom-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute right-4 top-1/2 w-16 h-16 rounded-full bg-white/10" />
            </div>
          </div>

          {params.search && (
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-brand-600" />
              <span className="text-sm text-slate-600">
                Results for <strong>&quot;{params.search}&quot;</strong>
              </span>
              <button
                onClick={() => {
                  const sp = new URLSearchParams(searchParams.toString())
                  sp.delete('search')
                  router.push(`${pathname}?${sp.toString()}`, { scroll: false })
                }}
                className="ml-1 p-1 rounded text-slate-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar filters desktop */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24 card p-5">
                <ProductFilters />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  {`${data?.total ?? 0} products`}
                  {params.category && <span>in <strong>{params.category}</strong></span>}
                  {isFetching && !isLoading && <Spinner size="sm" />}
                </p>
                <button
                  className="lg:hidden flex items-center gap-2 btn-secondary text-sm py-2"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>
              </div>

              {/* Initial full-page load only (no previous data yet) */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(LIMIT)].map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 bg-white">
                      <div className="skeleton aspect-square" />
                      <div className="p-4 space-y-2">
                        <div className="skeleton h-4 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                        <div className="skeleton h-6 w-1/3 rounded mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !data?.data.length ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No products found</p>
                  <button onClick={() => router.push(pathname, { scroll: false })} className="btn-secondary text-sm">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                  {data.data.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(params.page - 1)}
                    disabled={params.page <= 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - params.page) <= 1)
                    .reduce<(number | 'e')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('e')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, i) =>
                      item === 'e' ? (
                        <span key={`e${i}`} className="px-2 text-slate-400">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item as number)}
                          className={cn(
                            'w-9 h-9 rounded-xl text-sm font-medium transition-all',
                            item === params.page
                              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage(params.page + 1)}
                    disabled={params.page >= totalPages}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile filters drawer */}
          {mobileFiltersOpen && (
            <>
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
              <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-5">
                  <ProductFilters />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
