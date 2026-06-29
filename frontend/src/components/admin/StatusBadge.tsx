import { getStatusColor } from '@/lib/utils'
import { OrderStatus } from '@/types'

interface Props {
  status: OrderStatus
  className?: string
}

const labels: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span className={`badge ${getStatusColor(status)} ${className ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 mr-1.5 inline-block" />
      {labels[status]}
    </span>
  )
}
