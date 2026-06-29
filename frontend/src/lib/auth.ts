import { User } from '@/types'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token)
}

export const clearToken = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
}

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const setStoredUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const isAdmin = (user: User | null): boolean => user?.role === 'admin'
