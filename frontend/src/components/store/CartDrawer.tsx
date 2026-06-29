'use client'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { X, ShoppingCart, Plus, Minus, Trash2, Package, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-indigo-600">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-white" />
            <h2 className="font-semibold text-white">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Package className="h-10 w-10 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700">Your cart is empty</p>
                <p className="text-sm text-slate-500 mt-1">Add items to get started</p>
              </div>
              <button
                onClick={closeCart}
                className="btn-primary text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  {/* Image */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-7 w-7 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.product.category}</p>
                    <p className="text-sm font-bold text-brand-600 mt-1">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 rounded-l-lg hover:bg-slate-100 transition-colors text-slate-600"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockQuantity}
                          className="p-1 rounded-r-lg hover:bg-slate-100 transition-colors text-slate-600 disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Remove ${item.product.name}`}
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="text-xl font-bold gradient-text">{formatCurrency(getTotalPrice())}</span>
            </div>
            <p className="text-xs text-slate-400">Shipping & taxes calculated at checkout</p>

            {isAuthenticated() ? (
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary w-full justify-center text-base py-3"
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/auth/login?redirect=/checkout"
                onClick={closeCart}
                className="btn-primary w-full justify-center text-base py-3"
              >
                Sign in to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <button
              onClick={clearCart}
              className="btn-ghost w-full text-sm text-slate-500"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
