import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'
import { getBookingStatus } from '@/lib/utils/booking'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, Clock, MapPin, CreditCard, FileText, AlertCircle } from 'lucide-react'
import { UpdateBookingStatus } from '@/components/admin/update-booking-status'
import Image from 'next/image'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
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

  // Get booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      users:user_id (name, email),
      courts:court_id (name, location)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Booking fetch error:', error)
    notFound()
  }
  
  if (!booking) {
    notFound()
  }

  // Get payment proof URL if exists (using signed URL for private bucket)
  let paymentProofUrl = null
  if (booking.payment_proof) {
    const { data: signedData } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(booking.payment_proof, 3600) // 1 hour expiry
    
    paymentProofUrl = signedData?.signedUrl
  }

  const getStatusBadge = (booking: { status: string; booking_date: string; start_time: string; end_time: string }) => {
    const bookingStatus = getBookingStatus(booking.booking_date, booking.start_time, booking.end_time, booking.status)
    
    const variantMap = {
      green: 'default' as const,
      blue: 'default' as const,
      yellow: 'secondary' as const,
      red: 'destructive' as const,
      gray: 'secondary' as const,
    }

    return {
      label: bookingStatus.label,
      variant: variantMap[bookingStatus.color as keyof typeof variantMap],
    }
  }

  const statusBadge = getStatusBadge(booking)
  const bookingStatus = getBookingStatus(booking.booking_date, booking.start_time, booking.end_time, booking.status)
  const isExpired = bookingStatus.status === 'expired'
  const isUpcoming = bookingStatus.status === 'upcoming'

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      transfer: 'Transfer Bank',
      e_wallet: 'E-Wallet',
      qris: 'QRIS',
      credit_card: 'Kartu Kredit',
      cash: 'Cash',
    }
    return methods[method] || method
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/admin/bookings">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Booking
          </Button>
        </Link>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Booking #{booking.id}</h1>
            <p className="text-gray-600">
              Dibuat pada {formatDate(booking.created_at)}
            </p>
          </div>
          <Badge variant={statusBadge.variant} className="text-base px-4 py-2">
            {statusBadge.label}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expired/Upcoming Alert */}
            {isExpired && (
              <Card className="border-2 border-gray-300 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 mt-0.5 flex-shrink-0 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">Booking Kadaluarsa</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Waktu booking telah melewati batas yang ditentukan. Booking ini tidak dapat digunakan lagi.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isUpcoming && (
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 mt-0.5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900 text-lg">Booking Akan Datang</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Booking ini akan dimulai dalam 24 jam ke depan. Pastikan customer sudah dikonfirmasi.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tanggal</p>
                      <p className="font-semibold">{formatDate(booking.booking_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Waktu</p>
                      <p className="font-semibold">
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Lapangan</p>
                      <p className="font-semibold">{booking.courts?.name || booking.court_name || '-'}</p>
                      {booking.courts?.location && (
                        <p className="text-sm text-gray-500">{booking.courts.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Metode Pembayaran</p>
                      <p className="font-semibold">
                        {getPaymentMethodLabel(booking.payment_method)}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.notes && (
                  <div className="flex items-start gap-3 border-t pt-4">
                    <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Catatan</p>
                      <p className="font-semibold">{booking.notes}</p>
                    </div>
                  </div>
                )}
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
                    <p className="font-semibold">
                      {booking.hide_name ? 'Private' : (booking.booking_name || booking.users?.name || '-')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{booking.users?.email || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-sm text-gray-600">Total Harga</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(booking.price)}
                  </div>
                </div>

                {paymentProofUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Bukti Pembayaran:</p>
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-gray-100">
                      <Image
                        src={paymentProofUrl}
                        alt="Bukti Pembayaran"
                        fill
                        className="object-contain"
                        loading="eager"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Update Status */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <UpdateBookingStatus bookingId={booking.id} currentStatus={booking.status} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
