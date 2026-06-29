'use client'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  outline: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-200',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg',
  md: '',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
