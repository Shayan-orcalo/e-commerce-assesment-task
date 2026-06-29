import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  imageUrl: z.string().min(1, 'Product image is required').url('Must be a valid URL'),
  category: z.string().min(1, 'Category is required'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
})

export const checkoutSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Must be 16 digits'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Must be 3-4 digits'),
  cardName: z.string().min(2, 'Name required'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
