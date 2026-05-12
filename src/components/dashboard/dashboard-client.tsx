'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Package,
  ChevronRight
} from 'lucide-react'
import { UpcomingBookingsCard } from '@/components/bookings/upcoming-bookings-card'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'

interface DashboardClientProps {
  user: {
    id: string
    name: string
    email: string
  }
  bookingsCount: number
  ordersCount: number
  recentBookings: Array<{
    id: number
    court_name: string
    booking_date: string
    start_time: string
    end_time: string
    price: number
    status: string
    court?: {
      name: string
      location?: string
    }
  }>
  recentOrders: Array<{
    id: number
    total_amount: number
    status: string
    created_at: string
  }>
}

export function DashboardClient({ 
  user, 
  bookingsCount, 
  ordersCount,
  recentBookings,
  recentOrders 
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
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

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500'
      case 'pending': return 'bg-amber-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Terkonfirmasi'
      case 'pending': return 'Menunggu'
      case 'cancelled': return 'Dibatalkan'
      case 'completed': return 'Selesai'
      default: return status
    }
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-3"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-5xl font-bold mb-2"
            >
              {getGreeting()}, {user.name.split(' ')[0]}! 👋
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl opacity-90 max-w-2xl"
            >
              Siap untuk booking lapangan atau belanja produk olahraga hari ini?
            </motion.p>

            {/* Quick Stats in Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 grid grid-cols-2 gap-4 max-w-md"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold">{bookingsCount}</div>
                <div className="text-sm opacity-90">Total Booking</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-bold">{ordersCount}</div>
                <div className="text-sm opacity-90">Total Order</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <UpcomingBookingsCard userId={user.id} />
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Left Column - Quick Actions */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Aksi Cepat
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/courts" className="group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="inline-flex p-3 rounded-xl bg-emerald-600 text-white mb-4 group-hover:scale-110 transition-transform">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Booking Lapangan</h3>
                    <p className="text-sm text-gray-600 mb-4">Pesan lapangan favoritmu sekarang</p>
                    <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:gap-2 transition-all">
                      Booking Sekarang
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/products" className="group">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 border border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="inline-flex p-3 rounded-xl bg-orange-600 text-white mb-4 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Belanja Produk</h3>
                    <p className="text-sm text-gray-600 mb-4">Temukan perlengkapan olahraga terbaik</p>
                    <div className="flex items-center text-orange-600 font-medium text-sm group-hover:gap-2 transition-all">
                      Lihat Produk
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          {recentBookings && recentBookings.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Booking Terbaru
                </h2>
                <Link href="/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  Lihat Semua
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link href={`/bookings/${booking.id}`}>
                      <div className="group relative overflow-hidden rounded-xl bg-white p-4 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`} />
                              <span className="text-xs font-medium text-gray-500">
                                {getStatusLabel(booking.status)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {booking.court?.name || booking.court_name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(booking.booking_date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                              </div>
                            </div>
                            {booking.court?.location && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3" />
                                {booking.court.location}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600">
                              {formatCurrency(booking.price)}
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all ml-auto mt-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Column - Recent Orders & Links */}
        <motion.div variants={item} className="space-y-6">
          {/* Recent Orders */}
          {recentOrders && recentOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Order Terbaru
                </h2>
                <Link href="/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  Lihat Semua
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link href={`/orders/${order.id}`}>
                      <div className="group rounded-xl bg-white p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Order #{order.id}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                        </div>
                        <div className="text-lg font-bold text-purple-600 mb-1">
                          {formatCurrency(order.total_amount)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(order.created_at)}</span>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Menu Lainnya</h3>
            <div className="space-y-2">
              <Link href="/bookings" className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors group">
                <span className="text-sm font-medium text-gray-700">History Booking</span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link href="/orders" className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors group">
                <span className="text-sm font-medium text-gray-700">History Order</span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link href="/cart" className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors group">
                <span className="text-sm font-medium text-gray-700">Keranjang Belanja</span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
