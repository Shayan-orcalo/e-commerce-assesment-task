'use client'
import { Product } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { ShoppingCart, Star, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.stockQuantity === 0) return
    addItem(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card-hover group flex flex-col overflow-hidden h-full">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-slate-300" />
            </div>
          )}

          {/* Stock badge */}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
              <span className="bg-white text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low stock warning */}
          {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <div className="absolute top-2 left-2">
              <span className="bg-accent-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Only {product.stockQuantity} left
              </span>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-2 right-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(product.category)}`}>
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
            ))}
            <span className="text-xs text-slate-500 ml-1">(4.0)</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
            <span className="text-lg font-bold gradient-text">
              {formatCurrency(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-brand"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
