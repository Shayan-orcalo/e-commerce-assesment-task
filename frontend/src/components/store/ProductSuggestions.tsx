'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Product } from '@/types'
import ProductCard from './ProductCard'
import { Sparkles } from 'lucide-react'

interface Props {
  productId: string
}

export default function ProductSuggestions({ productId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['suggestions', productId],
    queryFn: async () => {
      const res = await api.get<Product[]>(`/products/suggestions?productId=${productId}`)
      return res.data
    },
    enabled: !!productId,
  })

  if (!isLoading && (!data || data.length === 0)) return null

  return (
    <section className="mt-16">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h2 className="text-xl font-bold text-slate-900">You Might Also Like</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton aspect-square" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-6 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
