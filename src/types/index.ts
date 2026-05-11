export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface Court {
  id: number
  name: string
  description?: string
  price_per_hour: number
  location?: string
  image?: string
  is_available: boolean
  facilities?: string[]
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  user_id: string
  court_id?: number
  court_name: string
  booking_name: string
  booking_date: string
  start_time: string
  end_time: string
  price: number
  payment_method: 'transfer' | 'e_wallet' | 'qris' | 'credit_card' | 'cash'
  payment_code?: string
  payment_proof?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
  hide_name: boolean
  created_at: string
  updated_at: string
  user?: User
  court?: Court
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  category?: string
  image?: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: string
  order_number: string
  total_price: number
  payment_method: string
  payment_proof?: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  customer_address: string
  notes?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  subtotal: number
  product?: Product
}

export interface CartItem {
  product: Product
  quantity: number
}
