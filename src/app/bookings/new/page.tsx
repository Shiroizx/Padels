'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { bookingSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import Link from 'next/link'
import { z } from 'zod'

type BookingForm = z.infer<typeof bookingSchema>

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courtId = searchParams.get('court_id')
  
  const [isLoading, setIsLoading] = useState(false)
  const [court, setCourt] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  
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
    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error('Booking gagal', {
        description: error.message || 'Terjadi kesalahan saat membuat booking',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!court || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        <Link href={`/courts/${court.id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Booking Lapangan: {court.name}</CardTitle>
            <p className="text-sm text-gray-600">
              {formatCurrency(court.price_per_hour)}/jam
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Booking Name */}
              <div className="space-y-2">
                <Label htmlFor="booking_name">
                  Nama Booking <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="booking_name"
                  {...register('booking_name')}
                  placeholder="Nama untuk booking (5-15 karakter)"
                  disabled={isLoading}
                />
                {errors.booking_name && (
                  <p className="text-sm text-red-600">{errors.booking_name.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Nama ini akan ditampilkan di jadwal lapangan
                </p>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="booking_date">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="booking_date"
                  type="date"
                  {...register('booking_date')}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                />
                {errors.booking_date && (
                  <p className="text-sm text-red-600">{errors.booking_date.message}</p>
                )}
              </div>

              {/* Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_time">
                    Waktu Mulai <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('start_time', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih waktu mulai" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="13:00">13:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="17:00">17:00</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="20:00">20:00</SelectItem>
                      <SelectItem value="21:00">21:00</SelectItem>
                      <SelectItem value="22:00">22:00</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.start_time && (
                    <p className="text-sm text-red-600">{errors.start_time.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Jam operasional: 09:00 - 22:00
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">
                    Waktu Selesai <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('end_time', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih waktu selesai" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="13:00">13:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="17:00">17:00</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="20:00">20:00</SelectItem>
                      <SelectItem value="21:00">21:00</SelectItem>
                      <SelectItem value="22:00">22:00</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.end_time && (
                    <p className="text-sm text-red-600">{errors.end_time.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Maksimal sampai jam 22:00
                  </p>
                </div>
              </div>

              {/* Calculated Price */}
              {calculatedPrice > 0 && (
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-sm text-gray-600">Total Harga</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculatedPrice)}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment_method">
                  Metode Pembayaran <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue('payment_method', value as any)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet (GoPay, OVO, Dana)</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash (Bayar di Tempat)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-sm text-red-600">{errors.payment_method.message}</p>
                )}
              </div>

              {/* Hide Name */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hide_name"
                  {...register('hide_name')}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isLoading}
                />
                <Label htmlFor="hide_name" className="font-normal">
                  Sembunyikan nama saya di jadwal publik
                </Label>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Catatan tambahan untuk booking"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Konfirmasi Booking'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
