'use client'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '@/lib/api'
import axios from 'axios'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Order } from '@/types'
import { ShieldCheck, Lock, CheckCircle2, Package, CreditCard, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#0f172a',
      fontFamily: 'inherit',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#94a3b8' },
      iconColor: '#6366f1',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
}

function CheckoutForm({ onSuccess }: { onSuccess: (orderId: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [cardName, setCardName] = useState('')
  const [cardComplete, setCardComplete] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  })

  const setAddr = (field: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress((prev) => ({ ...prev, [field]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    if (!address.fullName.trim() || !address.street.trim() || !address.city.trim() || !address.postcode.trim()) {
      toast.error('Please fill in your delivery address')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post<{ clientSecret: string; isMock?: boolean }>(
        '/payments/create-intent',
        { amount: getTotalPrice() },
      )

      const cartItems = items.map(i => ({ productId: i.productId, quantity: i.quantity }))

      if (data.isMock) {
        // No Stripe key configured — skip card processing, create order directly
        try {
          const res = await api.post<Order>('/orders', {
            paymentIntentId: `mock_${Date.now()}`,
            items: cartItems,
          })
          clearCart()
          onSuccess(res.data.id)
        } catch (orderErr) {
          if (axios.isAxiosError(orderErr) && orderErr.response?.status === 404) {
            clearCart()
            toast.error('Some items in your cart no longer exist. Your cart has been cleared — please add items again.')
          } else {
            throw orderErr
          }
        }
        return
      }

      // Real Stripe flow
      if (!stripe || !elements) {
        toast.error('Payment system not ready. Please refresh and try again.')
        return
      }
      if (!cardName.trim()) { toast.error('Please enter name on card'); return }
      if (!cardComplete) {
        toast.error(cardError || 'Please complete your card details (number, expiry date and CVV).')
        return
      }

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardName.trim() },
        },
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        try {
          const res = await api.post<Order>('/orders', {
            paymentIntentId: paymentIntent.id,
            items: cartItems,
          })
          clearCart()
          onSuccess(res.data.id)
        } catch (orderErr) {
          if (axios.isAxiosError(orderErr) && orderErr.response?.status === 404) {
            clearCart()
            toast.error('Some items in your cart no longer exist. Your cart has been cleared — please add items again.')
          } else {
            throw orderErr
          }
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
        <Lock className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">Secured by Stripe — test mode</span>
      </div>

      {/* Delivery Address */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">Delivery Address</h2>
        </div>

        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            placeholder="John Smith"
            value={address.fullName}
            onChange={setAddr('fullName')}
            className="input-base"
            required
          />
        </div>

        <div>
          <label className="label">Street Address</label>
          <input
            type="text"
            placeholder="123 High Street, Apt 4B"
            value={address.street}
            onChange={setAddr('street')}
            className="input-base"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">City</label>
            <input
              type="text"
              placeholder="London"
              value={address.city}
              onChange={setAddr('city')}
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="label">Postcode</label>
            <input
              type="text"
              placeholder="SW1A 1AA"
              value={address.postcode}
              onChange={setAddr('postcode')}
              className="input-base"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Country</label>
          <select
            value={address.country}
            onChange={setAddr('country')}
            className="input-base"
          >
            <option>United Kingdom</option>
            <option>United States</option>
            <option>Pakistan</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>Germany</option>
            <option>France</option>
          </select>
        </div>
      </div>

      {/* Payment Details */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">Payment Details</h2>
        </div>

        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-1">
            <p className="text-sm font-semibold text-amber-800">Demo Mode — no real payment taken</p>
            <p className="text-xs text-amber-700">
              Stripe is not configured. Click &ldquo;Place Order&rdquo; to simulate a successful payment.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="label">Name on Card</label>
              <input
                type="text"
                placeholder="John Smith"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label className="label">Card Details</label>
              <div className={`input-base py-3.5 ${cardError ? 'border-red-400 focus-within:ring-red-200' : ''}`}>
                <CardElement
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={(e) => {
                    setCardComplete(e.complete)
                    setCardError(e.error?.message ?? null)
                  }}
                />
              </div>
              {cardError ? (
                <p className="text-xs text-red-500 mt-1.5">{cardError}</p>
              ) : (
                <p className="text-xs text-slate-400 mt-1.5">
                  Test card: <span className="font-mono">4242 4242 4242 4242</span> · any future date · any CVV
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={loading || (!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !!cardError)}
        size="lg"
        className="w-full justify-center py-4"
      >
        <ShieldCheck className="h-5 w-5" />
        Place Order — {formatCurrency(getTotalPrice())}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { items, getTotalPrice, removeItem } = useCartStore()
  const [completed, setCompleted] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) router.push('/auth/login?redirect=/checkout')
  }, [isAuthenticated, router])

  // Validate all cart items against the DB — remove any whose IDs no longer exist
  useEffect(() => {
    if (items.length === 0) return
    const validate = async () => {
      const staleIds: string[] = []
      await Promise.all(
        items.map(async (item) => {
          try {
            await api.get(`/products/${item.productId}`)
          } catch {
            staleIds.push(item.productId)
          }
        })
      )
      if (staleIds.length > 0) {
        staleIds.forEach((id) => removeItem(id))
        toast.error(`${staleIds.length} item(s) are no longer available and have been removed from your cart.`)
      }
    }
    validate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (completed && orderId) {
    return (
      <div className="page-container py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-fade-in">
            <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Order Confirmed!</h1>
          <p className="text-slate-600 mb-2">Payment successful. Thank you for your purchase.</p>
          <p className="text-sm text-slate-400 mb-8">
            Order ID: <span className="font-mono font-semibold text-slate-600">{orderId.slice(0, 8).toUpperCase()}…</span>
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/orders" className="btn-primary justify-center py-3">View My Orders</Link>
            <Link href="/" className="btn-secondary justify-center py-3">Continue Shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Your cart is empty</h2>
        <Link href="/" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Elements stripe={stripePromise}>
            <CheckoutForm onSuccess={(id) => { setOrderId(id); setCompleted(true) }} />
          </Elements>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-slate-900 mb-5">Order Summary</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.product.imageUrl ? (
                      <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 flex-shrink-0">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-lg pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="gradient-text">{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
