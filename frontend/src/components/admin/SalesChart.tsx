'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { DashboardStats } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  stats: DashboardStats
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#6366f1',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#f43f5e',
}

export default function SalesChart({ stats }: Props) {
  const chartData = Object.entries(stats.ordersByStatus).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    statusKey: status,
    count,
  }))

  const topData = stats.topProducts.map((p) => ({
    name: p.productName.length > 14 ? p.productName.slice(0, 14) + '…' : p.productName,
    fullName: p.productName,
    units: p.unitsSold,
    revenue: p.revenue,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Orders by Status */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Orders by Status</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="status"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
              formatter={(val: number) => [val, 'Orders']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.statusKey} fill={STATUS_COLORS[entry.statusKey] ?? '#7c3aed'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {chartData.map((item) => (
            <div key={item.statusKey} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: STATUS_COLORS[item.statusKey] ?? '#7c3aed' }}
              />
              <span className="text-xs text-slate-600">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Top Selling Products</h3>
        {topData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No sales data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
                formatter={(val: number, name: unknown) => [
                  name === 'units' ? val + ' units' : formatCurrency(val),
                  name === 'units' ? 'Units Sold' : 'Revenue',
                ]}
                labelFormatter={(_: unknown, payload: unknown[]) => (payload as { payload?: { fullName?: string } }[])?.[0]?.payload?.fullName ?? ''}
              />
              <Bar dataKey="units" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
