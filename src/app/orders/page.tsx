import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Calendar, CreditCard, Eye } from 'lucide-react'

export default async function OrdersPage() {
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

  if (!user) {
    redirect('/login')
  }

  // Get user's orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        price,
        products (
          id,
          name,
          image
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu Pembayaran', variant: 'secondary' as const },
      paid: { label: 'Dibayar', variant: 'default' as const },
      processing: { label: 'Diproses', variant: 'default' as const },
      shipped: { label: 'Dikirim', variant: 'default' as const },
      delivered: { label: 'Selesai', variant: 'default' as const },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      transfer: 'Transfer Bank',
      e_wallet: 'E-Wallet',
      qris: 'QRIS',
      credit_card: 'Kartu Kredit',
      cash: 'COD',
    }
    return methods[method] || method
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Riwayat Pesanan</h1>
        </div>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold text-gray-600">
                Belum Ada Pesanan
              </h2>
              <p className="mb-6 text-gray-500">
                Anda belum memiliki riwayat pesanan
              </p>
              <Link href="/products">
                <Button>Belanja Sekarang</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status)
              const itemCount = order.order_items?.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0
              ) || 0

              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Order #{order.id}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {getPaymentMethodLabel(order.payment_method)}
                          </div>
                        </div>
                      </div>
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items Preview */}
                      <div className="space-y-2">
                        {order.order_items?.slice(0, 2).map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="flex-1">
                              {item.products?.name || 'Produk'}
                            </span>
                            <span className="text-gray-600">
                              {item.quantity}x {formatCurrency(item.price)}
                            </span>
                          </div>
                        ))}
                        {order.order_items && order.order_items.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{order.order_items.length - 2} produk lainnya
                          </p>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="flex items-center justify-between border-t pt-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Total ({itemCount} item)
                          </p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                        <Link href={`/orders/${order.id}`}>
                          <Button>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
