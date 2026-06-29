'use client'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingCart, Package, ArrowRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  if (items.length === 0) {
    return (
      <div className="page-container py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-slate-500 mb-8">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/" className="btn-primary text-base py-3 px-8">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} item{items.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/" className="btn-ghost text-sm flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card p-5 flex gap-4">
              {/* Image */}
              <Link href={`/products/${item.productId}`}>
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {item.product.imageUrl ? (
                    <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-semibold text-slate-900 hover:text-brand-600 transition-colors line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">{item.product.category}</p>
                    <p className="text-sm text-slate-400 mt-0.5">Unit price: {formatCurrency(item.product.price)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-2 hover:bg-white transition-colors text-slate-500"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stockQuantity}
                      className="px-3 py-2 hover:bg-white transition-colors text-slate-500 disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-lg font-bold gradient-text">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="btn-ghost text-sm text-slate-400 hover:text-red-500 mt-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear all items
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-slate-900 text-lg mb-5">Order Summary</h2>
            <div className="space-y-3 pb-4 border-b border-slate-100">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate pr-4">
                    {item.product.name} <span className="text-slate-400">×{item.quantity}</span>
                  </span>
                  <span className="font-medium text-slate-900 flex-shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center py-4 border-b border-slate-100">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between items-center pt-2 mb-6">
              <span className="font-bold text-slate-900 text-lg">Total</span>
              <span className="text-2xl font-black gradient-text">{formatCurrency(getTotalPrice())}</span>
            </div>

            {isAuthenticated() ? (
              <Link href="/checkout" className="btn-primary w-full justify-center text-base py-3.5">
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <div className="space-y-3">
                <Link href="/auth/login?redirect=/checkout" className="btn-primary w-full justify-center text-base py-3.5">
                  Sign in to Checkout
                </Link>
                <p className="text-center text-xs text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="text-brand-600 font-medium hover:underline">Sign up</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
