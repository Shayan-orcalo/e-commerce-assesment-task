import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: { default: 'LuxeShop — Premium E-Commerce', template: '%s | LuxeShop' },
  description: 'Discover premium products at unbeatable prices.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
