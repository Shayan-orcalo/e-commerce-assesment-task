import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)

export const formatDate = (dateStr: string): string =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr))

export const getCategoryColor = (category: string): string => {
  const map: Record<string, string> = {
    Electronics: 'bg-blue-100 text-blue-700',
    Clothing: 'bg-pink-100 text-pink-700',
    Books: 'bg-amber-100 text-amber-700',
    Sports: 'bg-green-100 text-green-700',
    Home: 'bg-purple-100 text-purple-700',
    Beauty: 'bg-rose-100 text-rose-700',
    Toys: 'bg-orange-100 text-orange-700',
    Food: 'bg-lime-100 text-lime-700',
  }
  return map[category] ?? 'bg-slate-100 text-slate-700'
}

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    shipped: 'bg-purple-100 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700 border-slate-200'
}

export const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Sports', 'Home', 'Beauty', 'Toys', 'Food']

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]
