'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, SignupInput } from '@/lib/validators'
import { api, getErrorMessage } from '@/lib/api'
import { AuthResponse } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, Lock, User, Package } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = data
      const res = await api.post<AuthResponse>('/auth/signup', payload)
      setAuth(res.data.user, res.data.access_token)
      toast.success(`Welcome to LuxeShop, ${res.data.user.name}!`)
      router.push('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-800 to-indigo-800 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LuxeShop</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-8">Join LuxeShop today — it&apos;s free</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Smith"
              icon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
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
              placeholder="Min 8 characters"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              icon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" loading={loading} size="lg" className="w-full justify-center mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
