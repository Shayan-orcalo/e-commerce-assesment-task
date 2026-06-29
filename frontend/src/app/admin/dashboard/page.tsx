'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DashboardStats } from '@/types'
import { formatCurrency } from '@/lib/utils'
import SalesChart from '@/components/admin/SalesChart'
import { PageSpinner } from '@/components/ui/Spinner'
import { TrendingUp, ShoppingBag, Clock, CheckCircle, Package, Users } from 'lucide-react'

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<DashboardStats>('/admin/dashboard')
      return res.data
    },
  })

  if (isLoading) return <PageSpinner />
  if (!stats) return null

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'from-brand-500 to-indigo-500',
      bg: 'bg-brand-50',
      text: 'text-brand-700',
    },
    {
      title: 'Total Orders',
      value: Object.values(stats.ordersByStatus).reduce((s, c) => s + c, 0),
      icon: ShoppingBag,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    {
      title: 'Pending',
      value: stats.ordersByStatus.pending ?? 0,
      icon: Clock,
      color: 'from-yellow-400 to-amber-400',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
    },
    {
      title: 'Delivered',
      value: stats.ordersByStatus.delivered ?? 0,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your store at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-brand`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <SalesChart stats={stats} />

      {/* Top products table */}
      {stats.topProducts.length > 0 && (
        <div className="card p-6 mt-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900">Top Selling Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Product</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">Units Sold</th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={p.productId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <span className="font-medium text-slate-900">{p.productName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">{p.unitsSold}</td>
                    <td className="py-3 px-4 text-right font-bold gradient-text">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
