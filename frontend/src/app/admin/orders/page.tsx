'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { Order, OrderStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/admin/StatusBadge'
import { PageSpinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { ShoppingBag, ChevronDown, Eye, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get<Order[]>('/admin/orders')
      return res.data
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      // Also invalidate the customer-facing order list ('my-orders') so a
      // status change is reflected there without needing a manual refresh.
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      qc.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Order status updated!')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSettled: () => setUpdatingId(null),
  })

  const filtered = orders?.filter((o) => !statusFilter || o.status === statusFilter) ?? []
  const counts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders?.filter((o) => o.status === s).length ?? 0
    return acc
  }, {})

  if (isLoading) return <PageSpinner />

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 text-sm mt-1">{orders?.length ?? 0} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !statusFilter
              ? 'bg-slate-900 text-white shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All <span className="ml-1.5 text-xs opacity-70">{orders?.length ?? 0}</span>
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              statusFilter === s
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s} <span className="ml-1.5 text-xs opacity-70">{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left py-3.5 px-5 text-slate-500 font-medium">Order</th>
                <th className="text-left py-3.5 px-4 text-slate-500 font-medium">Customer</th>
                <th className="text-left py-3.5 px-4 text-slate-500 font-medium">Date</th>
                <th className="text-right py-3.5 px-4 text-slate-500 font-medium">Total</th>
                <th className="text-left py-3.5 px-4 text-slate-500 font-medium">Status</th>
                <th className="text-right py-3.5 px-5 text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    No orders {statusFilter ? `with status "${statusFilter}"` : ''}
                  </td>
                </tr>
              ) : filtered.map((order) => {
                const nextStatuses = STATUS_TRANSITIONS[order.status]
                return (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-slate-700 font-medium">{order.user?.name ?? '—'}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[140px]">{order.user?.email ?? '—'}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-4 text-right font-bold gradient-text">{formatCurrency(order.total)}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          aria-label="View order"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {nextStatuses.length > 0 && (
                          <div className="relative">
                            <select
                              value=""
                              disabled={updatingId === order.id}
                              onChange={(e) => {
                                if (!e.target.value) return
                                setUpdatingId(order.id)
                                statusMutation.mutate({ id: order.id, status: e.target.value as OrderStatus })
                                e.target.value = ''
                              }}
                              className="pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white hover:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
                            >
                              <option value="">Update</option>
                              {nextStatuses.map((s) => (
                                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details" size="lg">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl text-sm">
              <div>
                <p className="text-slate-500">Order ID</p>
                <p className="font-mono font-semibold text-slate-900">#{viewOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-semibold text-slate-900">{formatDate(viewOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-slate-500">Customer</p>
                <p className="font-semibold text-slate-900">{viewOrder.user?.name ?? '—'}</p>
                <p className="text-xs text-slate-400">{viewOrder.user?.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <StatusBadge status={viewOrder.status} />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 text-sm">Items</h4>
              <div className="space-y-2">
                {viewOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{item.productName ?? 'Unknown product'}</p>
                      <p className="text-xs text-slate-500">
                        {item.priceAtPurchase != null ? formatCurrency(item.priceAtPurchase) : '—'} × {item.quantity ?? '—'}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900">
                      {item.priceAtPurchase != null && item.quantity != null
                        ? formatCurrency(item.priceAtPurchase * item.quantity)
                        : '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-xl font-black gradient-text">{formatCurrency(viewOrder.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
