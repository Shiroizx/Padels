import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Eye } from 'lucide-react'

export default async function BookingsPage() {
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

  // Get user's bookings
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, court:courts(*)')
    .eq('user_id', user.id)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">History Booking</h1>
            <p className="text-gray-600">Lihat semua booking Anda</p>
          </div>
          <Link href="/courts">
            <Button>Booking Baru</Button>
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            Error loading bookings: {error.message}
          </div>
        )}

        {!bookings || bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">Belum ada booking</p>
              <p className="mt-2 text-sm text-gray-400">
                Mulai booking lapangan sekarang!
              </p>
              <Link href="/courts">
                <Button className="mt-4">Lihat Lapangan</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{booking.court_name}</h3>
                          <p className="text-sm text-gray-600">
                            Booking: {booking.booking_name}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(booking.booking_date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                        {booking.court?.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 h-4 w-4" />
                            {booking.court.location}
                          </div>
                        )}
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(booking.price)}
                        </div>
                      </div>

                      {booking.status === 'pending' && !booking.payment_proof && booking.payment_method !== 'cash' && (
                        <div className="rounded-lg bg-yellow-50 p-2 text-sm text-yellow-700">
                          ⚠️ Menunggu upload bukti pembayaran
                        </div>
                      )}

                      {booking.status === 'pending' && booking.payment_proof && (
                        <div className="rounded-lg bg-blue-50 p-2 text-sm text-blue-700">
                          ℹ️ Menunggu konfirmasi admin
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 sm:flex-col">
                      <Link href={`/bookings/${booking.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
