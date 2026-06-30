'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  _hasHydrated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  setHasHydrated: (val: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      setAuth: (user, token) => {
        set({ user, token })
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token)
        }
      },
      clearAuth: () => {
        set({ user: null, token: null })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
        }
      },
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
