import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Eye } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  price: number
}

interface Order {
  id: string
  created_at: string
  customer_name: string
  total_amount: number
  payment_method: string
  payment_proof: string | null
  status: string
  users?: { email: string } | null
  order_items?: OrderItem[]
}

// Move OrderTable outside component
const OrderTable = ({ orders, getStatusBadge, getPaymentMethodLabel }: { 
  orders: Order[]
  getStatusBadge: (status: string) => { label: string; variant: 'secondary' | 'default' | 'destructive' }
  getPaymentMethodLabel: (method: string) => string
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Tanggal</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Items</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Pembayaran</TableHead>
        <TableHead>Bukti</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Aksi</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {orders.length === 0 ? (
        <TableRow>
          <TableCell colSpan={9} className="text-center text-gray-500">
            Tidak ada order
          </TableCell>
        </TableRow>
      ) : (
        orders.map((order) => {
          const statusBadge = getStatusBadge(order.status)
          const itemCount = order.order_items?.reduce(
            (sum, item) => sum + item.quantity,
            0
          ) || 0
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">{order.users?.email || '-'}</p>
                </div>
              </TableCell>
              <TableCell>{itemCount} item</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(order.total_amount)}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getPaymentMethodLabel(order.payment_method)}
                </Badge>
              </TableCell>
              <TableCell>
                {order.payment_proof ? (
                  <Badge className="bg-green-600">✓</Badge>
                ) : (
                  <Badge variant="secondary">-</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </TableCell>
              <TableCell>
                <Link href={`/admin/orders/${order.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          )
        })
      )}
    </TableBody>
  </Table>
)

export default async function AdminOrdersPage() {
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

  // Get all orders with user info
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      users (name, email),
      order_items (
        id,
        quantity,
        price
      )
    `)
    .order('created_at', { ascending: false })

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
      transfer: 'Transfer',
      e_wallet: 'E-Wallet',
      qris: 'QRIS',
      credit_card: 'Kartu Kredit',
      cash: 'COD',
    }
    return methods[method] || method
  }

  const pendingOrders = orders?.filter((o) => o.status === 'pending') || []
  const paidOrders = orders?.filter((o) => o.status === 'paid') || []
  const processingOrders = orders?.filter((o) => o.status === 'processing') || []
  const shippedOrders = orders?.filter((o) => o.status === 'shipped') || []
  const deliveredOrders = orders?.filter((o) => o.status === 'delivered') || []
  const cancelledOrders = orders?.filter((o) => o.status === 'cancelled') || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Kelola Order</h1>
          <p className="text-gray-600">Lihat dan kelola semua order produk</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Daftar Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">
                  Semua ({orders?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="paid">
                  Paid ({paidOrders.length})
                </TabsTrigger>
                <TabsTrigger value="processing">
                  Processing ({processingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="shipped">
                  Shipped ({shippedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="delivered">
                  Delivered ({deliveredOrders.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <OrderTable orders={orders || []} getStatusBadge={getStatusBadge} getPaymentMethodLabel={getPaymentMethodLabel} />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <OrderTable orders={pendingOrders} getStatusBadge={getStatusBadge} getPaymentMethodLabel={getPaymentMethodLabel} />
              </TabsContent>

              <TabsContent value="paid" className="mt-4">
                <OrderTable orders={paidOrders} getStatusBadge={getStatusBadge} getPaymentMethodLabel={getPaymentMethodLabel} />
              </TabsContent>

              <TabsContent value="processing" className="mt-4">
                <OrderTable orders={processingOrders} getStatusBadge={getStatusBadge} getPaymentMethodLabel={getPaymentMethodLabel} />
              </TabsContent>

              <TabsContent value="shipped" className="mt-4">
                <OrderTable orders={shippedOrders} getStatusBadge={getStatusBadge} getPaymentMethodLabel={getPaymentMethodLabel} />
              </TabsContent>

              <TabsContent value="delivered" className="mt-4">
                <OrderTable orders={deliveredOrders} getStatusBadge={getStatusBadge} getPaymentMethodLabel={getPaymentMethodLabel} />
              </TabsContent>

              <TabsContent value="cancelled" className="mt-4">
                <OrderTable orders={cancelledOrders} getStatusBadge={getStatusBadge} getPaymentMethodLabel={getPaymentMethodLabel} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
