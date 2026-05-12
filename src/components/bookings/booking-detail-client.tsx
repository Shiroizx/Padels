'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  FileText, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Download,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'
import { getBookingStatus } from '@/lib/utils/booking'
import { UploadPaymentProof } from '@/components/bookings/upload-payment-proof'
import { PaymentInstructions } from '@/components/bookings/payment-instructions'
import { PaymentProofViewer } from '@/components/shared/payment-proof-viewer'
import { toast } from 'sonner'

interface Booking {
  id: number
  user_id: string
  court_id: number
  court_name: string
  booking_name: string
  booking_date: string
  start_time: string
  end_time: string
  price: number
  payment_method: string
  payment_method_id?: number | null
  payment_code?: string | null
  payment_proof?: string | null
  status: string
  notes?: string | null
  hide_name: boolean
  court?: {
    location?: string
  }
}

interface Schedule {
  id: number
  start_time: string
  end_time: string
  status: string
  booking_name: string
  hide_name: boolean
}

interface BookingDetailClientProps {
  booking: Booking
  courtSchedule: Schedule[]
  paymentProofUrl: string | null
}

export function BookingDetailClient({ booking, courtSchedule, paymentProofUrl }: BookingDetailClientProps) {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const bookingStatus = getBookingStatus(booking.booking_date, booking.start_time, booking.end_time, booking.status)
  const isExpired = bookingStatus.status === 'expired'
  const isUpcoming = bookingStatus.status === 'upcoming'

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      transfer: '🏦 Transfer Bank',
      e_wallet: '📱 E-Wallet',
      qris: '📲 QRIS',
      credit_card: '💳 Credit Card',
      cash: '💵 Cash (Bayar di Tempat)',
    }
    return labels[method] || method
  }

  const getStatusConfig = () => {
    const configs = {
      expired: {
        color: 'bg-gray-600',
        label: 'Kadaluarsa',
        icon: AlertCircle,
        bgClass: 'bg-gray-50 border-gray-300',
        textClass: 'text-gray-700'
      },
      upcoming: {
        color: 'bg-blue-600',
        label: 'Akan Datang',
        icon: Clock,
        bgClass: 'bg-blue-50 border-blue-300',
        textClass: 'text-blue-700'
      },
      pending: {
        color: 'bg-yellow-600',
        label: 'Menunggu Pembayaran',
        icon: Clock,
        bgClass: 'bg-yellow-50 border-yellow-300',
        textClass: 'text-yellow-700'
      },
      confirmed: {
        color: 'bg-green-600',
        label: 'Confirmed',
        icon: CheckCircle,
        bgClass: 'bg-green-50 border-green-300',
        textClass: 'text-green-700'
      },
      cancelled: {
        color: 'bg-red-600',
        label: 'Dibatalkan',
        icon: AlertCircle,
        bgClass: 'bg-red-50 border-red-300',
        textClass: 'text-red-700'
      }
    }
    return configs[bookingStatus.status as keyof typeof configs] || configs.pending
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Kode berhasil disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link href="/bookings">
          <Button variant="ghost" className="group hover:bg-white/80">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke History
          </Button>
        </Link>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 lg:grid-cols-3"
      >
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Status Card */}
          <motion.div variants={item}>
            <div className={`relative overflow-hidden rounded-3xl ${statusConfig.bgClass} border-2 p-8 shadow-xl`}>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5" />
                      <span className="text-sm font-medium opacity-90">Booking Details</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{booking.court_name}</h1>
                    <p className="text-sm opacity-90">ID: #{booking.id}</p>
                  </div>
                  <Badge className={`${statusConfig.color} text-white text-base px-4 py-2`}>
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="rounded-xl bg-white/50 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Tanggal</span>
                    </div>
                    <p className="text-lg font-bold">{formatDate(booking.booking_date)}</p>
                  </div>
                  <div className="rounded-xl bg-white/50 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Waktu</span>
                    </div>
                    <p className="text-lg font-bold">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Alert Messages */}
          {isExpired && (
            <motion.div variants={item}>
              <div className="rounded-2xl bg-gray-50 p-6 border-2 border-gray-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Booking Kadaluarsa</h3>
                    <p className="text-sm text-gray-600">
                      Waktu booking telah melewati batas yang ditentukan. Booking ini tidak dapat digunakan lagi.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isUpcoming && (
            <motion.div variants={item}>
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border-2 border-blue-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">🎉 Booking Akan Datang!</h3>
                    <p className="text-sm text-blue-700">
                      Booking Anda akan dimulai dalam 24 jam ke depan. Pastikan Anda datang tepat waktu!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Booking Information Card */}
          <motion.div variants={item}>
            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6 md:p-8 space-y-6">
              {/* Court Info */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-100">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold">Informasi Lapangan</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">{booking.court_name}</p>
                  {booking.court?.location && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <span className="text-sm">📍</span>
                      {booking.court.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-100">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold">Detail Booking</h2>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-sm text-gray-600 mb-1">Nama Booking</div>
                    <div className="font-semibold text-gray-900">{booking.booking_name}</div>
                  </div>
                  {booking.notes && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="text-sm text-gray-600 mb-1">Catatan</div>
                      <div className="text-gray-900">{booking.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-100">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold">Pembayaran</h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-sm text-gray-600 mb-1">Metode Pembayaran</div>
                    <div className="font-semibold text-gray-900">
                      {getPaymentMethodLabel(booking.payment_method)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white">
                    <div className="text-sm opacity-90 mb-1">Total Pembayaran</div>
                    <div className="text-4xl font-bold">{formatCurrency(booking.price)}</div>
                  </div>

                  {/* Payment Code for Cash */}
                  {booking.payment_method === 'cash' && booking.payment_code && (
                    <div className="rounded-2xl border-2 border-dashed border-emerald-600 bg-emerald-50 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-emerald-900">Kode Pembayaran</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(booking.payment_code!)}
                          className="hover:bg-emerald-100"
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <code className="text-2xl font-bold text-emerald-600 block mb-2">
                        {booking.payment_code}
                      </code>
                      <p className="text-sm text-emerald-700">
                        💡 Tunjukkan kode ini saat pembayaran di tempat
                      </p>
                    </div>
                  )}

                  {/* Payment Proof */}
                  {booking.payment_method !== 'cash' && (
                    <div>
                      {booking.payment_proof && paymentProofUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center rounded-xl bg-blue-50 p-4 text-blue-700">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            <span className="font-medium">Bukti pembayaran sudah diupload</span>
                          </div>
                          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
                            <p className="mb-4 font-semibold text-gray-900">Bukti Pembayaran:</p>
                            <PaymentProofViewer imageUrl={paymentProofUrl} />
                            {booking.status === 'pending' && (
                              <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700">
                                ⏳ Menunggu verifikasi dari admin
                              </div>
                            )}
                            {booking.status === 'confirmed' && (
                              <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700 font-medium">
                                ✓ Pembayaran telah diverifikasi
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700 border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Menunggu upload bukti pembayaran</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Instructions */}
              {booking.status === 'pending' && booking.payment_method !== 'cash' && !booking.payment_proof && !isExpired && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-100">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-xl font-bold">Cara Pembayaran</h2>
                  </div>
                  <PaymentInstructions 
                    paymentMethod={booking.payment_method}
                    paymentMethodId={booking.payment_method_id}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Court Schedule */}
          <motion.div variants={item}>
            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-100">
                <Clock className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-bold">Jadwal Lapangan</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Jadwal booking untuk {booking.court_name} pada {formatDate(booking.booking_date)}
              </p>

              {courtSchedule && courtSchedule.length > 0 ? (
                <div className="space-y-3">
                  {courtSchedule.map((schedule) => {
                    const isCurrentBooking = schedule.id === booking.id
                    return (
                      <div
                        key={schedule.id}
                        className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                          isCurrentBooking
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isCurrentBooking ? 'bg-emerald-100' : 'bg-gray-200'
                          }`}>
                            <Clock className={`h-5 w-5 ${isCurrentBooking ? 'text-emerald-600' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {schedule.hide_name ? '🔒 Private' : schedule.booking_name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCurrentBooking && (
                            <Badge className="bg-emerald-600 text-white">
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
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada booking lain untuk tanggal ini</p>
                </div>
              )}

              {/* Operating Hours */}
              <div className="mt-6 rounded-xl bg-blue-50 p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Jam Operasional</p>
                    <p className="text-blue-700">09:00 - 22:00</p>
                    <p className="mt-2 text-sm text-blue-600">
                      💡 Slot yang tidak tertera di atas masih tersedia untuk booking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Actions */}
        <motion.div variants={item} className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Status Card */}
            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6">
              <h3 className="font-bold text-lg mb-4">Status Booking</h3>
              
              {isExpired && (
                <div className="rounded-2xl bg-gray-50 p-6 text-center border-2 border-gray-300">
                  <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                  <p className="font-bold text-gray-900 mb-1">Booking Kadaluarsa</p>
                  <p className="text-sm text-gray-600">Waktu booking telah lewat</p>
                </div>
              )}

              {!isExpired && booking.status === 'pending' && booking.payment_method !== 'cash' && !booking.payment_proof && (
                <>
                  <div className="rounded-xl bg-yellow-50 p-4 mb-4 border border-yellow-200">
                    <p className="font-semibold text-yellow-900 mb-1">⚠️ Upload Bukti Pembayaran</p>
                    <p className="text-sm text-yellow-700">
                      Silakan upload bukti transfer untuk memproses booking Anda
                    </p>
                  </div>
                  <UploadPaymentProof bookingId={booking.id} />
                </>
              )}

              {booking.status === 'pending' && booking.payment_proof && (
                <div className="rounded-2xl bg-blue-50 p-6 text-center border-2 border-blue-300">
                  <Clock className="mx-auto mb-3 h-12 w-12 text-blue-600 animate-pulse" />
                  <p className="font-bold text-blue-900 mb-1">Menunggu Verifikasi</p>
                  <p className="text-sm text-blue-700">
                    Bukti pembayaran sedang diverifikasi admin
                  </p>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center border-2 border-green-300">
                  <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600" />
                  <p className="font-bold text-green-900 mb-1">🎉 Booking Confirmed!</p>
                  <p className="text-sm text-green-700">Lihat Anda di lapangan!</p>
                </div>
              )}

              {booking.status === 'pending' && booking.payment_method === 'cash' && (
                <div className="rounded-2xl bg-blue-50 p-6 text-center border-2 border-blue-300">
                  <CreditCard className="mx-auto mb-3 h-12 w-12 text-blue-600" />
                  <p className="font-bold text-blue-900 mb-1">💵 Pembayaran Cash</p>
                  <p className="text-sm text-blue-700">Bayar di tempat saat datang</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6 space-y-3">
              <h3 className="font-bold text-lg mb-4">Aksi Cepat</h3>
              
              <Link href="/bookings">
                <Button variant="outline" className="w-full h-12 rounded-xl border-2">
                  📋 Lihat Semua Booking
                </Button>
              </Link>

              <Link href="/courts">
                <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold">
                  🎾 Booking Lagi
                </Button>
              </Link>
            </div>

            {/* Help Card */}
            <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h3 className="font-bold text-orange-900 mb-1">Butuh Bantuan?</h3>
                  <p className="text-sm text-orange-700">
                    Tim support kami siap membantu Anda 24/7
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-xl border-orange-300 hover:bg-orange-100">
                Hubungi Support
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
