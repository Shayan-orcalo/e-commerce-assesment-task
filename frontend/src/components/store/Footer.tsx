'use client'
import Link from 'next/link'
import { Package, Github, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

const SHOP_LINKS = [
  { label: 'All Products', href: '/' },
  { label: 'New Arrivals', href: '/?sort=newest' },
  { label: 'Best Sellers', href: '/?sort=popular' },
  { label: 'Sale', href: '/?category=Sale' },
]

const ACCOUNT_LINKS = [
  { label: 'My Orders', href: '/orders' },
  { label: 'Sign In', href: '/auth/login' },
  { label: 'Create Account', href: '/auth/signup' },
]

const SUPPORT_LINKS = [
  { label: 'FAQ', href: '#' },
  { label: 'Shipping Policy', href: '#' },
  { label: 'Returns & Refunds', href: '#' },
  { label: 'Contact Us', href: '#' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LuxeShop</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Premium products delivered to your door. Quality you can trust, prices you&apos;ll love.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-slate-500" />
                <span>support@luxeshop.co.uk</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-slate-500" />
                <span>+44 20 1234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-slate-500" />
                <span>London, United Kingdom</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-2.5">
              {ACCOUNT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {year} LuxeShop. All rights reserved.
          </p>

          {/* Payment badges */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'AMEX', 'PayPal'].map((b) => (
              <span
                key={b}
                className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700"
              >
                {b}
              </span>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="GitHub"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
