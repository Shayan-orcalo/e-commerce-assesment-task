'use client'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import { X, Heart, Package, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function WishlistDrawer() {
  const { items, isOpen, closeWishlist, removeItem } = useWishlistStore()
  const { addItem } = useCartStore()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleAddToCart = (product: (typeof items)[number]) => {
    if (product.stockQuantity === 0) return
    addItem(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={closeWishlist}
        />
      )}

      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-500 to-pink-600">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-white fill-white" />
            <h2 className="font-semibold text-white">Favourites</h2>
            {items.length > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeWishlist}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Close wishlist"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
                <Heart className="h-10 w-10 text-rose-200" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700">No favourites yet</p>
                <p className="text-sm text-slate-500 mt-1">Click the heart on any product to save it</p>
              </div>
              <button onClick={closeWishlist} className="btn-primary text-sm">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <Link
                    href={`/products/${product.id}`}
                    onClick={closeWishlist}
                    className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200"
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-7 w-7 text-slate-400" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.id}`}
                      onClick={closeWishlist}
                      className="text-sm font-semibold text-slate-900 line-clamp-1 hover:text-brand-600 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                    <p className="text-sm font-bold text-brand-600 mt-1">
                      {formatCurrency(product.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stockQuantity === 0}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        aria-label={`Remove ${product.name} from favourites`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
