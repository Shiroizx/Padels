import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, FileText, Copy, CheckCircle } from 'lucide-react'
import { UploadPaymentProof } from '@/components/bookings/upload-payment-proof'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookingDetailPage({ params }: PageProps) {
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

  if (!user) {
    redirect('/login')
  }

  // Get booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, court:courts(*)')
    .eq('id', id)
    .single()

  if (error || !booking) {
    notFound()
  }

  // Check authorization
  if (booking.user_id !== user.id && user.role !== 'admin') {
    redirect('/bookings')
  }

  // Get all bookings for the same court and date to show schedule
  const { data: courtSchedule } = await supabase
    .from('bookings')
    .select('id, start_time, end_time, status, booking_name, hide_name')
    .eq('court_id', booking.court_id)
    .eq('booking_date', booking.booking_date)
    .in('status', ['pending', 'confirmed'])
    .order('start_time', { ascending: true })

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

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      transfer: 'Transfer Bank',
      e_wallet: 'E-Wallet',
      qris: 'QRIS',
      credit_card: 'Credit Card',
      cash: 'Cash (Bayar di Tempat)',
    }
    return labels[method] || method
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/bookings">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke History
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">Detail Booking</CardTitle>
                    <p className="text-sm text-gray-600">ID: #{booking.id}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Court Info */}
                <div>
                  <h3 className="mb-3 font-semibold">Informasi Lapangan</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="font-medium">{booking.court_name}</span>
                    </div>
                    {booking.court?.location && (
                      <p className="text-sm text-gray-600 ml-6">{booking.court.location}</p>
                    )}
                  </div>
                </div>

                {/* Booking Info */}
                <div>
                  <h3 className="mb-3 font-semibold">Informasi Booking</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Calendar className="mr-2 mt-0.5 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Tanggal</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(booking.booking_date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="mr-2 mt-0.5 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Waktu</div>
                        <div className="text-sm text-gray-600">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FileText className="mr-2 mt-0.5 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Nama Booking</div>
                        <div className="text-sm text-gray-600">{booking.booking_name}</div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="flex items-start">
                        <FileText className="mr-2 mt-0.5 h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">Catatan</div>
                          <div className="text-sm text-gray-600">{booking.notes}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="mb-3 font-semibold">Informasi Pembayaran</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CreditCard className="mr-2 mt-0.5 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Metode Pembayaran</div>
                        <div className="text-sm text-gray-600">
                          {getPaymentMethodLabel(booking.payment_method)}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="text-sm text-gray-600">Total Pembayaran</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(booking.price)}
                      </div>
                    </div>

                    {/* Payment Code for Cash */}
                    {booking.payment_method === 'cash' && booking.payment_code && (
                      <div className="rounded-lg border-2 border-dashed border-green-600 bg-green-50 p-4">
                        <div className="text-sm font-medium text-gray-700">Kode Pembayaran</div>
                        <div className="mt-1 flex items-center justify-between">
                          <code className="text-lg font-bold text-green-600">
                            {booking.payment_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(booking.payment_code!)
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          Tunjukkan kode ini saat pembayaran di tempat
                        </p>
                      </div>
                    )}

                    {/* Payment Proof Status */}
                    {booking.payment_method !== 'cash' && (
                      <div>
                        {booking.payment_proof ? (
                          <div className="flex items-center rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Bukti pembayaran sudah diupload
                          </div>
                        ) : (
                          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
                            Menunggu upload bukti pembayaran
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Court Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Lapangan</CardTitle>
                <p className="text-sm text-gray-600">
                  Jadwal booking untuk {booking.court_name} pada {formatDate(booking.booking_date)}
                </p>
              </CardHeader>
              <CardContent>
                {courtSchedule && courtSchedule.length > 0 ? (
                  <div className="space-y-2">
                    {courtSchedule.map((schedule) => {
                      const isCurrentBooking = schedule.id === booking.id
                      return (
                        <div
                          key={schedule.id}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            isCurrentBooking
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {schedule.hide_name ? 'Private' : schedule.booking_name}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCurrentBooking && (
                              <Badge variant="outline" className="border-blue-500 text-blue-700">
                                Booking Anda
                              </Badge>
                            )}
                            <Badge
                              variant={schedule.status === 'confirmed' ? 'default' : 'secondary'}
                            >
                              {schedule.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-4">
                    Belum ada booking lain untuk tanggal ini
                  </div>
                )}
                
                {/* Available Hours Info */}
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-900">Jam Operasional</p>
                  <p className="text-sm text-blue-700">09:00 - 22:00</p>
                  <p className="mt-2 text-xs text-blue-600">
                    Slot yang tidak tertera di atas masih tersedia untuk booking
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Aksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {booking.status === 'pending' && booking.payment_method !== 'cash' && !booking.payment_proof && (
                  <UploadPaymentProof bookingId={booking.id} />
                )}

                {booking.status === 'confirmed' && (
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                    <p className="font-medium text-green-700">Booking Confirmed!</p>
                    <p className="mt-1 text-sm text-green-600">
                      Lihat Anda di lapangan!
                    </p>
                  </div>
                )}

                <Link href="/bookings">
                  <Button variant="outline" className="w-full">
                    Lihat Semua Booking
                  </Button>
                </Link>

                <Link href="/courts">
                  <Button className="w-full">
                    Booking Lagi
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
