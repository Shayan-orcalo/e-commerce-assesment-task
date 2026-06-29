'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validators'
import { api, getErrorMessage } from '@/lib/api'
import { AuthResponse } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, Lock, Package } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      const res = await api.post<AuthResponse>('/auth/login', data)
      setAuth(res.data.user, res.data.access_token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      router.push(res.data.user.role === 'admin' ? '/admin/dashboard' : redirect)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-800 to-indigo-800 flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LuxeShop</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" loading={loading} size="lg" className="w-full justify-center mt-2">
              Sign In
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Demo Accounts</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Customer:</span>
                <span className="font-mono text-slate-700">customer@shop.com / Customer1234!</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Admin:</span>
                <span className="font-mono text-slate-700">admin@shop.com / Admin1234!</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-brand-600 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
