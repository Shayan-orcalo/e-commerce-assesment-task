'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

interface WishlistState {
  items: Product[]
  isOpen: boolean
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  openWishlist: () => void
  closeWishlist: () => void
  getTotalItems: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) =>
        set((state) => ({
          items: state.items.find((i) => i.id === product.id)
            ? state.items
            : [...state.items, product],
        })),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),

      toggleItem: (product) => {
        const { isInWishlist, addItem, removeItem } = get()
        if (isInWishlist(product.id)) removeItem(product.id)
        else addItem(product)
      },

      isInWishlist: (productId) => get().items.some((i) => i.id === productId),

      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),

      getTotalItems: () => get().items.length,
    }),
    {
      name: 'wishlist-store',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
