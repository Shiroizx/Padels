import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductImage } from '@/components/shared/product-image'
import { UpdateOrderStatus } from '@/components/admin/update-order-status'
import { ArrowLeft, User, Phone, MapPin, CreditCard, FileText } from 'lucide-react'
import Image from 'next/image'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get order details
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      users (name, email),
      order_items (
        id,
        quantity,
        price,
        products (
          id,
          name,
          image,
          category
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Get payment proof URL if exists (using signed URL for private bucket)
  let paymentProofUrl = null
  if (order.payment_proof) {
    const { data: signedData } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(order.payment_proof, 3600) // 1 hour expiry
    
    paymentProofUrl = signedData?.signedUrl
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      paid: { label: 'Paid', variant: 'default' as const },
      processing: { label: 'Processing', variant: 'default' as const },
      shipped: { label: 'Shipped', variant: 'default' as const },
      delivered: { label: 'Delivered', variant: 'default' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      transfer: 'Transfer Bank',
      e_wallet: 'E-Wallet (GoPay, OVO, Dana)',
      qris: 'QRIS',
      credit_card: 'Kartu Kredit',
      cash: 'Cash on Delivery (COD)',
    }
    return methods[method] || method
  }

  const statusBadge = getStatusBadge(order.status)
  
  interface OrderItem {
    id: string
    quantity: number
    price: number
  }
  
  const itemCount = order.order_items?.reduce(
    (sum: number, item: OrderItem) => sum + item.quantity,
    0
  ) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/admin/orders">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Order
          </Button>
        </Link>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-600">
              Dibuat pada {formatDate(order.created_at)}
            </p>
          </div>
          <Badge variant={statusBadge.variant} className="text-base px-4 py-2">
            {statusBadge.label}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Produk Pesanan ({itemCount} item)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.order_items?.map((item: { id: string; quantity: number; price: number; products?: { id: string; name: string; image: string; category: string } | null }) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b pb-4 last:border-b-0"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                      <ProductImage
                        image={item.products?.image}
                        alt={item.products?.name || 'Produk'}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-semibold">
                          {item.products?.name || 'Produk'}
                        </p>
                        {item.products?.category && (
                          <p className="text-sm text-gray-500">
                            {item.products.category}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.quantity}x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nama</p>
                    <p className="font-semibold">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{order.users?.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-semibold">{order.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Alamat</p>
                    <p className="font-semibold">{order.customer_address}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Catatan</p>
                      <p className="font-semibold">{order.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className="text-green-600">GRATIS</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Metode:</span>
                    <span className="font-semibold">
                      {getPaymentMethodLabel(order.payment_method)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Proof */}
            {order.payment_proof && paymentProofUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Bukti Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-64 w-full overflow-hidden rounded-lg border bg-gray-100">
                    <Image
                      src={paymentProofUrl}
                      alt="Bukti Pembayaran"
                      fill
                      className="object-contain"
                      loading="eager"
                      unoptimized
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Update Status */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
