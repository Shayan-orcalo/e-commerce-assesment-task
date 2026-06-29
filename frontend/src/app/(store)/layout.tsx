import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'

// Wraps all store sub-pages (products, cart, checkout, orders, auth) with Navbar
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-16 min-h-screen bg-slate-50">{children}</main>
    </>
  )
}
