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
import { formatDate, formatTime } from '@/lib/utils/date'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye } from 'lucide-react'

export default async function AdminBookingsPage() {
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

  // Get all bookings with user and court info
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      *,
      users:user_id (name, email),
      courts:court_id (name)
    `)
    .order('created_at', { ascending: false })

  // Log error if any
  if (bookingsError) {
    console.error('Bookings query error:', bookingsError)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      confirmed: { label: 'Confirmed', variant: 'default' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const },
      completed: { label: 'Completed', variant: 'default' as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      transfer: 'Transfer',
      e_wallet: 'E-Wallet',
      qris: 'QRIS',
      credit_card: 'Kartu Kredit',
      cash: 'Cash',
    }
    return methods[method] || method
  }

  const pendingBookings = bookings?.filter((b) => b.status === 'pending') || []
  const confirmedBookings = bookings?.filter((b) => b.status === 'confirmed') || []
  const completedBookings = bookings?.filter((b) => b.status === 'completed') || []
  const cancelledBookings = bookings?.filter((b) => b.status === 'cancelled') || []

  const BookingTable = ({ bookings }: { bookings: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Waktu</TableHead>
          <TableHead>Lapangan</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Pembayaran</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-gray-500">
              Tidak ada booking
            </TableCell>
          </TableRow>
        ) : (
          bookings.map((booking: any) => {
            const statusBadge = getStatusBadge(booking.status)
            return (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">#{booking.id}</TableCell>
                <TableCell>{formatDate(booking.booking_date)}</TableCell>
                <TableCell>
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </TableCell>
                <TableCell>{booking.courts?.name || '-'}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.users?.name || '-'}</p>
                    <p className="text-xs text-gray-500">{booking.users?.email || '-'}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(booking.price)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getPaymentMethodLabel(booking.payment_method)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/bookings/${booking.id}`}>
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
          <h1 className="text-3xl font-bold">Kelola Booking</h1>
          <p className="text-gray-600">Lihat dan kelola semua booking lapangan</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daftar Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">
                  Semua ({bookings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed ({confirmedBookings.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedBookings.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <BookingTable bookings={bookings || []} />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <BookingTable bookings={pendingBookings} />
              </TabsContent>

              <TabsContent value="confirmed" className="mt-4">
                <BookingTable bookings={confirmedBookings} />
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <BookingTable bookings={completedBookings} />
              </TabsContent>

              <TabsContent value="cancelled" className="mt-4">
                <BookingTable bookings={cancelledBookings} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
