'use client'
import { useQuery } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { Order } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/admin/StatusBadge'
import { PageSpinner } from '@/components/ui/Spinner'
import { Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) router.push('/auth/login?redirect=/orders')
  }, [isAuthenticated, router])

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/orders')
      return res.data
    },
    enabled: isAuthenticated(),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="page-container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-slate-500 text-sm mt-1">Track your order history</p>
      </div>

      {!orders?.length ? (
        <div className="card p-16 text-center">
          <ShoppingBag className="h-14 w-14 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No orders yet</h2>
          <p className="text-slate-400 mb-6">When you place an order, it will appear here.</p>
          <Link href="/" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              {/* Order header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Package className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <StatusBadge status={order.status} />
                  </div>
                  <span className="font-bold gradient-text">{formatCurrency(order.total)}</span>
                  {expanded === order.id
                    ? <ChevronUp className="h-5 w-5 text-slate-400" />
                    : <ChevronDown className="h-5 w-5 text-slate-400" />
                  }
                </div>
              </div>

              {/* Expanded items */}
              {expanded === order.id && (
                <div className="border-t border-slate-100 bg-slate-50 animate-fade-in">
                  <div className="p-5 sm:hidden">
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="px-5 pb-5 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white rounded-xl p-4 border border-slate-100">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{item.productName ?? 'Unknown product'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {item.priceAtPurchase != null ? formatCurrency(item.priceAtPurchase) : '—'} × {item.quantity ?? '—'}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {item.priceAtPurchase != null && item.quantity != null
                            ? formatCurrency(item.priceAtPurchase * item.quantity)
                            : '—'}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <p className="text-lg font-bold gradient-text">
                        Total: {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
