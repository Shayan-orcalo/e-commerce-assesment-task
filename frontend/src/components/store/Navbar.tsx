'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, LayoutDashboard, Package, ChevronDown, Menu, X, Search } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const router = useRouter()
  const { getTotalItems, openCart } = useCartStore()
  const { user, clearAuth, isAuthenticated } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) router.push(`/?search=${encodeURIComponent(searchVal.trim())}`)
  }

  const handleLogout = () => {
    clearAuth()
    setUserMenuOpen(false)
    router.push('/')
  }

  const totalItems = getTotalItems()

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-white border-b border-slate-100'
      )}
    >
      <div className="page-container">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center shadow-brand">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LuxeShop</span>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="input-base pl-10 pr-4 h-10"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center animate-fade-in">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Auth — only render after Zustand hydration to avoid Sign In flash */}
            {!mounted ? (
              <div className="hidden sm:block w-24 h-9 bg-slate-100 rounded-xl animate-pulse" />
            ) : isAuthenticated() && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-slide-up">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="h-4 w-4 text-slate-400" />
                        My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-slate-400" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-slate-100"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm py-2">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm py-2">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search + menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-3 animate-slide-up">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="input-base pl-10"
                />
              </div>
            </form>
            {mounted && !isAuthenticated() && (
              <div className="flex gap-2">
                <Link href="/auth/login" className="btn-ghost flex-1 text-center">Sign In</Link>
                <Link href="/auth/signup" className="btn-primary flex-1 text-center">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
