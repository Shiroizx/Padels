import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Password tidak cocok',
  path: ['password_confirmation'],
})

export const bookingSchema = z.object({
  court_id: z.number().optional(),
  booking_name: z.string().min(5, 'Minimal 5 karakter').max(15, 'Maksimal 15 karakter'),
  booking_date: z.string().min(1, 'Tanggal harus diisi'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu: HH:mm'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu: HH:mm'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  payment_method: z.enum(['transfer', 'e_wallet', 'qris', 'credit_card', 'cash']),
  hide_name: z.boolean().optional(),
  notes: z.string().optional(),
})

export const courtSchema = z.object({
  name: z.string().min(1, 'Nama lapangan harus diisi'),
  description: z.string().optional(),
  price_per_hour: z.number().min(0, 'Harga tidak boleh negatif'),
  location: z.string().optional(),
  is_available: z.boolean().optional(),
  facilities: z.array(z.string()).optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  description: z.string().optional(),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.number().int().min(0, 'Stok tidak boleh negatif'),
  category: z.string().optional(),
  is_available: z.boolean().optional(),
})

export const orderSchema = z.object({
  customer_name: z.string().min(1, 'Nama harus diisi'),
  customer_phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  customer_address: z.string().min(10, 'Alamat minimal 10 karakter'),
  payment_method: z.string().min(1, 'Metode pembayaran harus dipilih'),
  notes: z.string().optional(),
})
