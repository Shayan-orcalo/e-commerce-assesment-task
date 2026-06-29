'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Product } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { PageSpinner } from '@/components/ui/Spinner'
import ProductSuggestions from '@/components/store/ProductSuggestions'
import {
  ShoppingCart, ArrowLeft, Package, Star, Check, Minus, Plus, Share2, Heart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { addItem } = useCartStore()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get<Product>(`/products/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  if (isLoading) return <PageSpinner />
  if (error || !product) {
    return (
      <div className="page-container py-20 text-center">
        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Product not found</h2>
        <Link href="/" className="btn-primary">Back to Shop</Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (product.stockQuantity === 0) return
    addItem(product, qty)
    setAdded(true)
    toast.success(`${qty}× ${product.name} added to cart!`)
    setTimeout(() => setAdded(false), 2000)
  }

  const inStock = product.stockQuantity > 0

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-brand-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Shop
        </Link>
        <span>/</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
          {product.category}
        </span>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-card-hover">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-slate-300" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                <span className="bg-white text-slate-700 font-bold text-lg px-6 py-3 rounded-2xl shadow">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Action pills */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors">
              <Heart className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Link copied!'))}
              className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center text-slate-500 hover:text-brand-600 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-100'}`} />
              ))}
            </div>
            <span className="text-sm text-slate-600 font-medium">4.0</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">128 reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-4xl font-black gradient-text">{formatCurrency(product.price)}</span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-slate-600 leading-relaxed mb-6 text-[15px]">{product.description}</p>
          )}

          {/* Stock indicator */}
          <div className="flex items-center gap-2 mb-6">
            {inStock ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">
                  {product.stockQuantity <= 10
                    ? `Only ${product.stockQuantity} left in stock`
                    : 'In Stock'}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity selector */}
          {inStock && (
            <div className="mb-6">
              <label className="label">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 hover:bg-slate-50 transition-colors text-slate-600 border-r border-slate-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-14 text-center font-bold text-slate-900 text-lg">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
                    className="px-4 py-3 hover:bg-slate-50 transition-colors text-slate-600 border-l border-slate-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-slate-400">{product.stockQuantity} available</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`btn-primary text-base py-4 px-8 rounded-2xl justify-center ${added ? 'from-emerald-600 to-emerald-500' : ''}`}
          >
            {added ? (
              <>
                <Check className="h-5 w-5" />
                Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </>
            )}
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-slate-100">
            {[
              { icon: '🚚', label: 'Free Delivery', sub: 'Over £50' },
              { icon: '↩️', label: 'Easy Returns', sub: '30 days' },
              { icon: '🔒', label: 'Secure Payment', sub: '256-bit SSL' },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="text-xs font-semibold text-slate-700">{b.label}</p>
                <p className="text-xs text-slate-400">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <ProductSuggestions productId={id} />
    </div>
  )
}
