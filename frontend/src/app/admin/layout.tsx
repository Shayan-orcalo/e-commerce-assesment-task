'use client'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { Menu, Package } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login?redirect=/admin/dashboard')
    } else if (!isAdmin()) {
      router.push('/')
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated() || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" text="Verifying access..." />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Admin Panel</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
