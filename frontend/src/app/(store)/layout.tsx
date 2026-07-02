'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import WishlistDrawer from '@/components/store/WishlistDrawer'
import Footer from '@/components/store/Footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/auth')) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <WishlistDrawer />
      <main className="pt-16 min-h-screen bg-slate-50">{children}</main>
      <Footer />
    </>
  )
}
