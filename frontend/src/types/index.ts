export type UserRole = 'customer' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  category: string
  stockQuantity: number
  createdAt: string
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: Product
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  productId: string | null
  productName: string
  quantity: number
  priceAtPurchase: number
}

export interface Order {
  id: string
  userId: string
  total: number
  status: OrderStatus
  createdAt: string
  items: OrderItem[]
  user?: User
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ProductFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'price_asc' | 'price_desc' | 'newest'
  page?: number
  limit?: number
}

export interface DashboardStats {
  totalRevenue: number
  ordersByStatus: Record<OrderStatus, number>
  topProducts: {
    productId: string
    productName: string
    unitsSold: number
    revenue: number
  }[]
}

export interface ApiError {
  statusCode: number
  message: string
  timestamp: string
  path: string
}

export interface LocalCartItem {
  productId: string
  quantity: number
  product: Product
}
