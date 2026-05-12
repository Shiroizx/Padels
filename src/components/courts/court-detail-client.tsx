'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Calendar,
  Star,
  Shield,
  Zap,
  Users,
  Sparkles
} from 'lucide-react'
import { CourtImage } from '@/components/shared/court-image'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'

interface Court {
  id: number
  name: string
  location: string
  description: string
  price_per_hour: number
  image: string | null
  is_available: boolean
  facilities?: string[]
}

interface Booking {
  id: number
  start_time: string
  end_time: string
  booking_name: string
  hide_name: boolean
  status: string
}

interface CourtDetailClientProps {
  court: Court
  todayBookings: Booking[]
}

export function CourtDetailClient({ court, todayBookings }: CourtDetailClientProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const getTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }

  const isSlotBooked = (slot: string) => {
    const slotHour = parseInt(slot.split(':')[0])
    return todayBookings.some(booking => {
      const startHour = parseInt(booking.start_time.split(':')[0])
      const endHour = parseInt(booking.end_time.split(':')[0])
      return slotHour >= startHour && slotHour < endHour
    })
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
        <Link href="/courts">
          <Button variant="ghost" className="group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar Lapangan
          </Button>
        </Link>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 lg:grid-cols-3"
      >
        {/* Left Column - Court Details */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
            <div className="relative h-[400px] md:h-[500px]">
              {court.image ? (
                <CourtImage
                  imageUrl={court.image}
                  alt={court.name}
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Calendar className="h-24 w-24 text-gray-300" />
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              
              {/* Floating Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl md:text-5xl font-bold mb-3"
                    >
                      {court.name}
                    </motion.h1>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 text-lg"
                    >
                      <MapPin className="h-5 w-5" />
                      {court.location}
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {court.is_available ? (
                      <div className="px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold shadow-lg">
                        Tersedia
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold shadow-lg">
                        Tidak Tersedia
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {court.description && (
            <motion.div
              variants={item}
              className="rounded-2xl bg-white p-6 md:p-8 border border-gray-200 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-600" />
                Tentang Lapangan
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {court.description}
              </p>
            </motion.div>
          )}

          {/* Facilities */}
          {court.facilities && court.facilities.length > 0 && (
            <motion.div
              variants={item}
              className="rounded-2xl bg-white p-6 md:p-8 border border-gray-200 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                Fasilitas
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {court.facilities.map((facility: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{facility}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Today's Schedule */}
          <motion.div
            variants={item}
            className="rounded-2xl bg-white p-6 md:p-8 border border-gray-200 shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-emerald-600" />
              Jadwal Hari Ini
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {getTimeSlots().map((slot) => {
                const isBooked = isSlotBooked(slot)
                return (
                  <div
                    key={slot}
                    className={`p-3 rounded-xl text-center font-medium transition-all ${
                      isBooked
                        ? 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                    }`}
                  >
                    {slot}
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              <span className="inline-block w-3 h-3 rounded bg-emerald-50 border-2 border-emerald-200 mr-2" />
              Tersedia
              <span className="inline-block w-3 h-3 rounded bg-gray-100 border-2 border-gray-200 ml-4 mr-2" />
              Sudah dibooking
            </p>
          </motion.div>
        </motion.div>

        {/* Right Column - Booking Card */}
        <motion.div variants={item} className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Price Card */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Harga per jam</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-6">
                {formatCurrency(court.price_per_hour)}
              </div>
              
              {court.is_available ? (
                <Link href={`/bookings/new?court_id=${court.id}`}>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-emerald-600 hover:bg-gray-100 font-bold text-lg h-14 shadow-lg"
                  >
                    Booking Sekarang
                  </Button>
                </Link>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full bg-white/20 text-white cursor-not-allowed font-bold text-lg h-14"
                  disabled
                >
                  Tidak Tersedia
                </Button>
              )}
            </div>

            {/* Benefits */}
            <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Keuntungan Booking</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Konfirmasi Instan</p>
                    <p className="text-sm text-gray-600">Langsung dapat konfirmasi booking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pembayaran Aman</p>
                    <p className="text-sm text-gray-600">Berbagai metode pembayaran</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Flexible Reschedule</p>
                    <p className="text-sm text-gray-600">Bisa ubah jadwal booking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Support 24/7</p>
                    <p className="text-sm text-gray-600">Customer service siap membantu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
