'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { bookingSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { TimeSlotSelector } from '@/components/bookings/time-slot-selector'
import Link from 'next/link'
import { z } from 'zod'
import { motion } from 'framer-motion'

type BookingForm = z.infer<typeof bookingSchema>

function NewBookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courtId = searchParams.get('court_id')
  
  const [isLoading, setIsLoading] = useState(false)
  const [court, setCourt] = useState<{ id: string; name: string; price_per_hour: number } | null>(null)
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      hide_name: false,
    },
  })

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  // Load user and court data
  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setUser(userData)

      if (courtId) {
        const { data: courtData } = await supabase
          .from('courts')
          .select('*')
          .eq('id', courtId)
          .single()

        if (courtData) {
          setCourt(courtData)
          setValue('court_id', parseInt(courtId))
        }
      }
    }

    loadData()
  }, [courtId, router, supabase, setValue])

  // Calculate price based on time
  useEffect(() => {
    if (startTime && endTime && court) {
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)
      
      const startInMinutes = startHour * 60 + startMinute
      const endInMinutes = endHour * 60 + endMinute
      
      if (endInMinutes > startInMinutes) {
        const durationInHours = (endInMinutes - startInMinutes) / 60
        const price = durationInHours * court.price_per_hour
        setCalculatedPrice(price)
        setValue('price', price)
      }
    }
  }, [startTime, endTime, court, setValue])

  const onSubmit = async (data: BookingForm) => {
    setIsLoading(true)

    try {
      if (!user) throw new Error('User not found')
      if (!court) throw new Error('Court not found')

      // Validate time range (09:00 - 22:00)
      const [startHour] = data.start_time.split(':').map(Number)
      const [endHour] = data.end_time.split(':').map(Number)
      
      if (startHour < 9 || startHour >= 22) {
        toast.error('Waktu tidak valid', {
          description: 'Waktu mulai harus antara jam 09:00 - 22:00',
        })
        setIsLoading(false)
        return
      }
      
      if (endHour < 9 || endHour > 22) {
        toast.error('Waktu tidak valid', {
          description: 'Waktu selesai harus antara jam 09:00 - 22:00',
        })
        setIsLoading(false)
        return
      }

      // Check availability
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('*')
        .eq('court_id', data.court_id)
        .eq('booking_date', data.booking_date)
        .neq('status', 'cancelled')
        .or(`and(start_time.lte.${data.start_time},end_time.gt.${data.start_time}),and(start_time.lt.${data.end_time},end_time.gte.${data.end_time}),and(start_time.gte.${data.start_time},end_time.lte.${data.end_time})`)

      if (conflicts && conflicts.length > 0) {
        toast.error('Lapangan tidak tersedia', {
          description: 'Waktu yang dipilih sudah dibooking. Silakan pilih waktu lain.',
        })
        setIsLoading(false)
        return
      }

      // Generate payment code for cash
      let paymentCode = null
      if (data.payment_method === 'cash') {
        const date = new Date()
        const dateStr = date.toISOString().split('T')[0]
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        paymentCode = `${dateStr}-${random}`
      }

      // Create booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          court_id: data.court_id,
          court_name: court.name,
          booking_name: data.booking_name,
          booking_date: data.booking_date,
          start_time: data.start_time,
          end_time: data.end_time,
          price: data.price,
          payment_method: data.payment_method,
          payment_code: paymentCode,
          hide_name: data.hide_name || false,
          notes: data.notes,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Booking berhasil!', {
        description: data.payment_method === 'cash' 
          ? 'Silakan catat kode pembayaran Anda'
          : 'Silakan upload bukti pembayaran',
      })

      router.push(`/bookings/${booking.id}`)
    } catch (error) {
      console.error('Booking error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat booking'
      toast.error('Booking gagal', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!court || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat data booking...</p>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-6 md:py-10">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href={`/courts/${court.id}`}>
            <Button variant="ghost" className="mb-6 group hover:bg-white/80">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Detail Lapangan
            </Button>
          </Link>
        </motion.div>

        {/* Main Grid Layout */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-8 lg:grid-cols-5"
        >
          {/* Left Column - Form (3 columns) */}
          <motion.div variants={item} className="lg:col-span-3 space-y-6">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-sm font-medium opacity-90">Booking Lapangan</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{court.name}</h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(court.price_per_hour)}</span>
                  <span className="text-sm opacity-90">per jam</span>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <motion.div 
              variants={item}
              className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6 md:p-8"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Section: Informasi Booking */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-emerald-100">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Informasi Booking</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking_name" className="text-base font-semibold">
                    Nama Booking <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="booking_name"
                    {...register('booking_name')}
                    placeholder="Contoh: Tim Badminton"
                    disabled={isLoading}
                    className="h-12 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {errors.booking_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-lg">⚠️</span>
                      {errors.booking_name.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-base">💡</span>
                    <span>Nama ini akan ditampilkan di jadwal lapangan (5-15 karakter)</span>
                  </p>
                </div>
              </div>

              {/* Section: Pilih Jadwal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-emerald-100">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Pilih Jadwal</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking_date" className="text-base font-semibold">
                    Tanggal Booking <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="booking_date"
                    type="date"
                    {...register('booking_date')}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                    onChange={(e) => {
                      setValue('booking_date', e.target.value)
                      setSelectedDate(e.target.value)
                      // Reset time selections when date changes
                      setValue('start_time', '')
                      setValue('end_time', '')
                    }}
                    className="h-12 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {errors.booking_date && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-lg">⚠️</span>
                      {errors.booking_date.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Time Slot Selector */}
              {selectedDate && court && (
                <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6 border border-emerald-100">
                  <TimeSlotSelector
                    courtId={parseInt(court.id)}
                    selectedDate={selectedDate}
                    selectedStartTime={startTime}
                    selectedEndTime={endTime}
                    onStartTimeChange={(time) => setValue('start_time', time)}
                    onEndTimeChange={(time) => setValue('end_time', time)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Section: Pembayaran */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-emerald-100">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Metode Pembayaran</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method" className="text-base font-semibold">
                    Pilih Metode Pembayaran <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('payment_method', value as 'transfer' | 'e_wallet' | 'qris' | 'credit_card' | 'cash')}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">🏦 Transfer Bank</SelectItem>
                      <SelectItem value="e_wallet">📱 E-Wallet (GoPay, OVO, Dana)</SelectItem>
                      <SelectItem value="qris">📲 QRIS</SelectItem>
                      <SelectItem value="credit_card">💳 Credit Card</SelectItem>
                      <SelectItem value="cash">💵 Cash (Bayar di Tempat)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_method && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="text-lg">⚠️</span>
                      {errors.payment_method.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Section: Informasi Tambahan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-emerald-100">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Informasi Tambahan</h2>
                </div>

                {/* Hide Name */}
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="hide_name"
                      {...register('hide_name')}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <Label htmlFor="hide_name" className="text-base font-medium cursor-pointer">
                        🔒 Sembunyikan nama saya di jadwal publik
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Nama booking Anda tidak akan ditampilkan di jadwal lapangan yang bisa dilihat orang lain
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-base font-semibold">
                    Catatan (Opsional)
                  </Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Tambahkan catatan khusus untuk booking Anda..."
                    rows={4}
                    disabled={isLoading}
                    className="rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg hover:shadow-xl transition-all" 
                  disabled={isLoading || !calculatedPrice}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses Booking...
                    </>
                  ) : (
                    <>
                      🎯 Konfirmasi Booking
                      {calculatedPrice > 0 && (
                        <span className="ml-2">• {formatCurrency(calculatedPrice)}</span>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>

        {/* Right Column - Summary (2 columns) */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Price Summary Card */}
          {calculatedPrice > 0 && (
            <div className="sticky top-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-medium opacity-90">Ringkasan Booking</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm opacity-90 mb-1">Total Pembayaran</div>
                  <div className="text-4xl md:text-5xl font-bold">
                    {formatCurrency(calculatedPrice)}
                  </div>
                </div>

                {startTime && endTime && (
                  <div className="pt-4 border-t border-white/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Durasi</span>
                      <span className="font-semibold">
                        {(() => {
                          const [startHour] = startTime.split(':').map(Number)
                          const [endHour] = endTime.split(':').map(Number)
                          return `${endHour - startHour} jam`
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Waktu</span>
                      <span className="font-semibold">{startTime} - {endTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Harga per jam</span>
                      <span className="font-semibold">{formatCurrency(court.price_per_hour)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="space-y-4">
            {/* Benefit 1 */}
            <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Konfirmasi Instan</h3>
                  <p className="text-sm text-gray-600">
                    Booking Anda akan langsung dikonfirmasi setelah pembayaran terverifikasi
                  </p>
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Pembayaran Aman</h3>
                  <p className="text-sm text-gray-600">
                    Berbagai metode pembayaran tersedia dengan sistem yang aman dan terpercaya
                  </p>
                </div>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Flexible Reschedule</h3>
                  <p className="text-sm text-gray-600">
                    Bisa mengubah jadwal booking sesuai kebutuhan Anda
                  </p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 border border-orange-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Butuh Bantuan?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Tim customer service kami siap membantu Anda 24/7
                  </p>
                  <Button variant="outline" size="sm" className="rounded-lg border-orange-300 hover:bg-orange-100">
                    Hubungi Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <NewBookingContent />
    </Suspense>
  )
}
