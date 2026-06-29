'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, LogOut, Store, ChevronRight, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    onClose()
    router.push('/')
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col z-30',
      'transition-transform duration-300 ease-in-out',
      open ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0',
    )}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center shadow-brand flex-shrink-0">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg">LuxeShop</span>
            <p className="text-slate-400 text-xs">Admin Panel</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="h-4 w-4 ml-auto opacity-60" />}
            </Link>
          )
        })}

        <div className="pt-2 mt-2 border-t border-slate-800">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
          >
            <Store className="h-5 w-5" />
            View Storefront
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all duration-150"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
