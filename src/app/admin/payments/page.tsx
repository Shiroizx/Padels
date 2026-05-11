import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { PaymentApprovalCard } from '@/components/admin/payment-approval-card'

export default async function AdminPaymentsPage() {
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

  // Get pending bookings with payment proof
  const { data: pendingBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      users (name, email),
      courts (name, location)
    `)
    .eq('status', 'pending')
    .not('payment_proof', 'is', null)
    .order('created_at', { ascending: false })

  // Get pending orders with payment proof
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select(`
      *,
      users (name, email),
      order_items (
        id,
        quantity,
        price,
        products (name)
      )
    `)
    .eq('status', 'pending')
    .not('payment_proof', 'is', null)
    .order('created_at', { ascending: false })

  // Generate signed URLs for bookings
  const bookingsWithUrls = await Promise.all(
    (pendingBookings || []).map(async (booking) => {
      if (booking.payment_proof) {
        const { data: signedData, error } = await supabase.storage
          .from('payment-proofs')
          .createSignedUrl(booking.payment_proof, 3600)
        
        if (error) {
          console.error(`Failed to generate signed URL for booking ${booking.id}:`, error)
        }
        
        return {
          ...booking,
          paymentProofUrl: signedData?.signedUrl || null
        }
      }
      return { ...booking, paymentProofUrl: null }
    })
  )

  // Generate signed URLs for orders
  const ordersWithUrls = await Promise.all(
    (pendingOrders || []).map(async (order) => {
      if (order.payment_proof) {
        const { data: signedData, error } = await supabase.storage
          .from('payment-proofs')
          .createSignedUrl(order.payment_proof, 3600)
        
        if (error) {
          console.error(`Failed to generate signed URL for order ${order.id}:`, error)
          console.error(`Payment proof path: ${order.payment_proof}`)
        }
        
        return {
          ...order,
          paymentProofUrl: signedData?.signedUrl || null
        }
      }
      return { ...order, paymentProofUrl: null }
    })
  )

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
          <h1 className="text-3xl font-bold">Approve Pembayaran</h1>
          <p className="text-gray-600">Verifikasi bukti pembayaran booking dan order</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pembayaran Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bookings">
                  Booking ({bookingsWithUrls?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="orders">
                  Order ({ordersWithUrls?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="mt-6">
                {!bookingsWithUrls || bookingsWithUrls.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    Tidak ada booking yang menunggu approval
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {bookingsWithUrls.map((booking: any) => (
                      <PaymentApprovalCard
                        key={booking.id}
                        type="booking"
                        data={booking}
                        paymentProofUrl={booking.paymentProofUrl}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders" className="mt-6">
                {!ordersWithUrls || ordersWithUrls.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    Tidak ada order yang menunggu approval
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {ordersWithUrls.map((order: any) => (
                      <PaymentApprovalCard
                        key={order.id}
                        type="order"
                        data={order}
                        paymentProofUrl={order.paymentProofUrl}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
