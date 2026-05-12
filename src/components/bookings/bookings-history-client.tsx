'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Eye, 
  AlertCircle,
  Sparkles,
  Filter,
  Search,
  TrendingUp,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'
import { getBookingStatus } from '@/lib/utils/booking'

interface Booking {
  id: number
  court_name: string
  booking_name: string
  booking_date: string
  start_time: string
  end_time: string
  price: number
  status: string
  payment_method: string
  payment_proof?: string | null
  court?: {
    location?: string
  }
}

interface BookingsHistoryClientProps {
  bookings: Booking[]
  error?: string
}

export function BookingsHistoryClient({ bookings, error }: BookingsHistoryClientProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filteredBookings, setFilteredBookings] = useState(bookings)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = bookings.filter(booking =>
      booking.court_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => {
        const status = getBookingStatus(booking.booking_date, booking.start_time, booking.end_time, booking.status)
        return status.status === filterStatus
      })
    }

    setFilteredBookings(filtered)
  }, [searchQuery, filterStatus, bookings])

  const getStatusConfig = (booking: Booking) => {
    const status = getBookingStatus(booking.booking_date, booking.start_time, booking.end_time, booking.status)
    
    const configs = {
      expired: {
        color: 'bg-gray-600',
        label: 'Kadaluarsa',
        icon: XCircle,
        bgClass: 'bg-gray-50 border-gray-200',
        textClass: 'text-gray-700'
      },
      upcoming: {
        color: 'bg-blue-600',
        label: 'Akan Datang',
        icon: Clock,
        bgClass: 'bg-blue-50 border-blue-200',
        textClass: 'text-blue-700'
      },
      pending: {
        color: 'bg-yellow-600',
        label: 'Pending',
        icon: Clock,
        bgClass: 'bg-yellow-50 border-yellow-200',
        textClass: 'text-yellow-700'
      },
      confirmed: {
        color: 'bg-green-600',
        label: 'Confirmed',
        icon: CheckCircle,
        bgClass: 'bg-green-50 border-green-200',
        textClass: 'text-green-700'
      },
      cancelled: {
        color: 'bg-red-600',
        label: 'Dibatalkan',
        icon: XCircle,
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-700'
      }
    }
    
    return configs[status.status as keyof typeof configs] || configs.pending
  }

  const getStats = () => {
    const total = bookings.length
    const upcoming = bookings.filter(b => {
      const status = getBookingStatus(b.booking_date, b.start_time, b.end_time, b.status)
      return status.status === 'upcoming'
    }).length
    const confirmed = bookings.filter(b => b.status === 'confirmed').length
    const pending = bookings.filter(b => b.status === 'pending').length
    
    return { total, upcoming, confirmed, pending }
  }

  const stats = getStats()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-3"
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">History Booking</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl font-bold mb-3"
                >
                  Riwayat Booking Anda 📋
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl opacity-90"
                >
                  Kelola dan pantau semua booking lapangan Anda
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/courts">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 font-bold shadow-lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Booking Baru
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
                <div className="text-sm opacity-90 mb-1">Total Booking</div>
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
                <div className="text-sm opacity-90 mb-1">Akan Datang</div>
                <div className="text-3xl font-bold">{stats.upcoming}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
                <div className="text-sm opacity-90 mb-1">Confirmed</div>
                <div className="text-3xl font-bold">{stats.confirmed}</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
                <div className="text-sm opacity-90 mb-1">Pending</div>
                <div className="text-3xl font-bold">{stats.pending}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari lapangan atau nama booking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 h-12 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="upcoming">Akan Datang</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="expired">Kadaluarsa</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Menampilkan <span className="font-semibold text-emerald-600">{filteredBookings.length}</span> booking
          </span>
          {(searchQuery || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterStatus('all')
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Reset filter
            </button>
          )}
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-600 mb-8"
        >
          <p className="font-medium">Error loading bookings</p>
          <p className="text-sm mt-1">{error}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white border-2 border-dashed border-gray-200 p-12 text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchQuery || filterStatus !== 'all' ? 'Tidak ada hasil' : 'Belum ada booking'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterStatus !== 'all'
              ? 'Coba kata kunci lain atau reset filter' 
              : 'Mulai booking lapangan sekarang!'}
          </p>
          <Link href="/courts">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Plus className="mr-2 h-5 w-5" />
              Lihat Lapangan
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Bookings List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredBookings.map((booking, index) => {
            const statusConfig = getStatusConfig(booking)
            const StatusIcon = statusConfig.icon
            const bookingStatus = getBookingStatus(booking.booking_date, booking.start_time, booking.end_time, booking.status)
            const isExpired = bookingStatus.status === 'expired'
            const isUpcoming = bookingStatus.status === 'upcoming'

            return (
              <motion.div
                key={booking.id}
                variants={item}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Link href={`/bookings/${booking.id}`}>
                  <div className="rounded-2xl bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Main Info */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                              {booking.court_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Booking: <span className="font-medium">{booking.booking_name}</span>
                            </p>
                          </div>
                          <Badge className={`${statusConfig.color} text-white px-3 py-1`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Tanggal</div>
                              <div className="font-medium text-gray-900">{formatDate(booking.booking_date)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Waktu</div>
                              <div className="font-medium text-gray-900">
                                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                              </div>
                            </div>
                          </div>

                          {booking.court?.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Lokasi</div>
                                <div className="font-medium text-gray-900 truncate">{booking.court.location}</div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Total</div>
                              <div className="font-bold text-green-600">{formatCurrency(booking.price)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Alerts */}
                        {isExpired && (
                          <div className={`rounded-xl ${statusConfig.bgClass} border p-3`}>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-sm">Booking Kadaluarsa</p>
                                <p className="text-xs opacity-80 mt-0.5">
                                  Waktu booking telah melewati batas yang ditentukan
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {isUpcoming && (
                          <div className={`rounded-xl ${statusConfig.bgClass} border p-3`}>
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" />
                              <div>
                                <p className="font-medium text-sm">🎉 Booking Akan Datang!</p>
                                <p className="text-xs opacity-80 mt-0.5">
                                  Booking Anda akan dimulai dalam 24 jam ke depan
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {booking.status === 'pending' && !booking.payment_proof && booking.payment_method !== 'cash' && !isExpired && (
                          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3">
                            <p className="text-sm text-yellow-700 font-medium">
                              ⚠️ Menunggu upload bukti pembayaran
                            </p>
                          </div>
                        )}

                        {booking.status === 'pending' && booking.payment_proof && !isExpired && (
                          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                            <p className="text-sm text-blue-700 font-medium">
                              ℹ️ Menunggu konfirmasi admin
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Action */}
                      <div className="flex lg:flex-col items-center justify-center lg:justify-start gap-3">
                        <Button 
                          className="w-full lg:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 group-hover:shadow-lg transition-all"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
