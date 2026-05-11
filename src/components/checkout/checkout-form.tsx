'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/currency'
import { ProductImage } from '@/components/shared/product-image'
import { toast } from 'sonner'
import { Loader2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { orderSchema } from '@/lib/utils/validation'

type OrderFormData = z.infer<typeof orderSchema>

interface CheckoutFormProps {
  userId: string
  userEmail: string
  userName: string
}

export function CheckoutForm({ userId, userEmail, userName }: CheckoutFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      payment_method: 'transfer',
      customer_name: userName, // Auto-fill from user account
    },
  })

  const paymentMethod = watch('payment_method')

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-600">
            Keranjang Anda Kosong
          </h2>
          <p className="mb-6 text-gray-500">
            Tidak ada produk untuk di-checkout
          </p>
          <Link href="/products">
            <Button>Belanja Sekarang</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: getTotalPrice(),
          status: 'pending',
          payment_method: data.payment_method,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          notes: data.notes,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      clearCart()

      toast.success('Pesanan berhasil dibuat!', {
        description: 'Silakan upload bukti pembayaran',
      })

      router.push(`/orders/${order.id}`)
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error('Checkout gagal', {
        description: error.message || 'Terjadi kesalahan saat membuat pesanan',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Penerima</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Email dari akun Anda (tidak dapat diubah)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_name">Nama Lengkap *</Label>
                <Input
                  id="customer_name"
                  {...register('customer_name')}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.customer_name && (
                  <p className="text-sm text-red-600">{errors.customer_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">Nomor Telepon *</Label>
                <Input
                  id="customer_phone"
                  {...register('customer_phone')}
                  placeholder="08xxxxxxxxxx"
                />
                {errors.customer_phone && (
                  <p className="text-sm text-red-600">{errors.customer_phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_address">Alamat Lengkap *</Label>
                <Textarea
                  id="customer_address"
                  {...register('customer_address')}
                  placeholder="Masukkan alamat lengkap untuk pengiriman"
                  rows={3}
                />
                {errors.customer_address && (
                  <p className="text-sm text-red-600">{errors.customer_address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Pilih Metode Pembayaran *</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setValue('payment_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet (GoPay, OVO, Dana)</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                    <SelectItem value="credit_card">Kartu Kredit</SelectItem>
                    <SelectItem value="cash">Cash on Delivery (COD)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-sm text-red-600">{errors.payment_method.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Catatan untuk penjual"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                      <ProductImage
                        productId={item.product.id}
                        image={item.product.image}
                        alt={item.product.name}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity}x {formatCurrency(item.product.price)}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="text-green-600">GRATIS</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Buat Pesanan'
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
