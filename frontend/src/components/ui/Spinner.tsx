import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export function Spinner({ className, size = 'md', text }: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-brand-600', sizes[size])} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" text="Loading..." />
    </div>
  )
}
