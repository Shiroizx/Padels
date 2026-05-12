'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Clock,
  Award,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/currency'

interface OrderItem {
  id: string
  quantity: number
  price: number
}

interface Order {
  id: string
  created_at: string
  total_amount: number
  status: string
  customer_name: string
  payment_proof: string | null
  order_items: OrderItem[]
}

interface Court {
  id: string
  name: string
  price_per_hour: number
}

interface Booking {
  id: string
  created_at: string
  booking_date: string
  start_time: string
  end_time: string
  price: number  // Changed from total_price to price
  status: string
  customer_name: string
  booking_name: string  // Add this as it's in the data
  payment_proof: string | null
  courts: Court | null
}

interface SPKClientProps {
  orders: Order[]
  bookings: Booking[]
}

interface SAWResult {
  id: string
  type: 'order' | 'booking'
  customerName: string
  amount: number
  status: string
  createdAt: string
  hasPaymentProof: boolean
  waitingTime: number
  normalizedScores: {
    amount: number
    waitingTime: number
    paymentProof: number
  }
  finalScore: number
  rank: number
}

export function SPKClient({ orders, bookings }: SPKClientProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length
    const totalBookings = bookings.length
    
    // Calculate revenue with validation
    const orderRevenue = orders.reduce((sum, o) => {
      const amount = Number(o.total_amount)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const bookingRevenue = bookings.reduce((sum, b) => {
      const amount = Number(b.price)  // Changed from total_price to price
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const totalRevenue = orderRevenue + bookingRevenue

    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered').length
    const paidBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length
    
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length

    const ordersWithProof = orders.filter(o => o.payment_proof).length
    const bookingsWithProof = bookings.filter(b => b.payment_proof).length

    return {
      totalOrders,
      totalBookings,
      totalTransactions: totalOrders + totalBookings,
      orderRevenue,
      bookingRevenue,
      totalRevenue,
      paidOrders,
      paidBookings,
      pendingOrders,
      pendingBookings,
      ordersWithProof,
      bookingsWithProof,
      orderConversionRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0,
      bookingConversionRate: totalBookings > 0 ? (paidBookings / totalBookings) * 100 : 0
    }
  }, [orders, bookings])

  // SAW Analysis for combined orders and bookings
  const sawAnalysis = useMemo(() => {
    const allTransactions: SAWResult[] = []

    // Process orders - with validation
    orders.forEach(order => {
      // Skip if essential data is missing
      if (!order.id || !order.created_at || order.total_amount == null) {
        return
      }

      const calculatedWaiting = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60))
      const waitingTime = Math.max(1, calculatedWaiting) // Minimum 1 hour to avoid issues
      
      allTransactions.push({
        id: order.id,
        type: 'order',
        customerName: order.customer_name || 'Unknown Customer',
        amount: Number(order.total_amount) || 0,
        status: order.status || 'pending',
        createdAt: order.created_at,
        hasPaymentProof: !!order.payment_proof,
        waitingTime,
        normalizedScores: { amount: 0, waitingTime: 0, paymentProof: 0 },
        finalScore: 0,
        rank: 0
      })
    })

    // Process bookings - with validation
    bookings.forEach(booking => {
      // Skip if essential data is missing
      if (!booking.id || !booking.created_at || booking.price == null) {
        return
      }

      const calculatedWaiting = Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60 * 60))
      const waitingTime = Math.max(1, calculatedWaiting) // Minimum 1 hour to avoid issues
      
      allTransactions.push({
        id: booking.id,
        type: 'booking',
        customerName: booking.booking_name || booking.customer_name || 'Unknown Customer',  // Use booking_name first
        amount: Number(booking.price) || 0,  // Changed from total_price to price
        status: booking.status || 'pending',
        createdAt: booking.created_at,
        hasPaymentProof: !!booking.payment_proof,
        waitingTime,
        normalizedScores: { amount: 0, waitingTime: 0, paymentProof: 0 },
        finalScore: 0,
        rank: 0
      })
    })

    if (allTransactions.length === 0) return []

    // Find min and max for normalization - with validation
    const amounts = allTransactions.map(t => t.amount).filter(a => !isNaN(a) && a > 0)
    const waitingTimes = allTransactions.map(t => t.waitingTime).filter(w => !isNaN(w) && w > 0)
    
    // If no valid data, return empty
    if (amounts.length === 0 || waitingTimes.length === 0) return []
    
    const maxAmount = Math.max(...amounts)
    const maxWaitingTime = Math.max(...waitingTimes)

    // Ensure max values are valid
    if (maxAmount === 0 || maxWaitingTime === 0 || isNaN(maxAmount) || isNaN(maxWaitingTime)) {
      return []
    }

    const normalized = allTransactions.map(transaction => {
      // BENEFIT: Amount - Semakin besar semakin baik → X / Max
      const normalizedAmount = (transaction.amount > 0 && maxAmount > 0) 
        ? transaction.amount / maxAmount 
        : 0

      // BENEFIT: Waiting Time - Semakin lama menunggu semakin prioritas → X / Max
      // (Bukan COST! Karena yang lama menunggu harus diprioritaskan)
      const normalizedWaitingTime = (transaction.waitingTime > 0 && maxWaitingTime > 0)
        ? transaction.waitingTime / maxWaitingTime
        : 0

      // BENEFIT: Payment Proof - Ada bukti = 1, tidak ada = 0
      const normalizedPaymentProof = transaction.hasPaymentProof ? 1 : 0

      // Calculate final score with weights
      // Amount: 40%, Waiting Time: 35%, Payment Proof: 25%
      const calculatedScore = 
        (normalizedAmount * 0.40) +
        (normalizedWaitingTime * 0.35) +
        (normalizedPaymentProof * 0.25)
      
      // Handle NaN - if any calculation fails, set to 0
      const finalScore = (isNaN(calculatedScore) || !isFinite(calculatedScore)) ? 0 : calculatedScore

      return {
        ...transaction,
        normalizedScores: {
          amount: isNaN(normalizedAmount) ? 0 : normalizedAmount,
          waitingTime: isNaN(normalizedWaitingTime) ? 0 : normalizedWaitingTime,
          paymentProof: normalizedPaymentProof
        },
        finalScore
      }
    })

    // Ranking: Sort by finalScore DESCENDING (highest score = rank 1)
    return normalized
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((item, index) => ({ ...item, rank: index + 1 }))
  }, [orders, bookings])

  // Top performers
  const topTransactions = sawAnalysis.slice(0, 5)
  const topOrders = sawAnalysis.filter(t => t.type === 'order').slice(0, 3)
  const topBookings = sawAnalysis.filter(t => t.type === 'booking').slice(0, 3)

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color }: any) => (
    <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BarChart3 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold">
                  Sistem Penunjang Keputusan
                </h1>
                <p className="text-lg opacity-90 mt-2">
                  Analisis Orders & Bookings dengan Metode SAW
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm opacity-90">
                {stats.totalTransactions} transaksi • {formatCurrency(stats.totalRevenue)} total revenue
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-14">
          <TabsTrigger value="overview" className="text-base">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-base">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-base">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="ranking" className="text-base">
            <Award className="h-4 w-4 mr-2" />
            Ranking SAW
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Transaksi"
              value={stats.totalTransactions}
              subtitle={`${stats.totalOrders} orders, ${stats.totalBookings} bookings`}
              icon={Activity}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue || 0)}
              subtitle="Orders + Bookings"
              icon={DollarSign}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Conversion Rate"
              value={`${(((stats.paidOrders + stats.paidBookings) / (stats.totalTransactions || 1)) * 100).toFixed(1)}%`}
              subtitle="Paid / Total"
              icon={Target}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatCard
              title="Pending"
              value={stats.pendingOrders + stats.pendingBookings}
              subtitle="Menunggu pembayaran"
              icon={Clock}
              color="bg-gradient-to-br from-amber-500 to-amber-600"
            />
          </div>

          {/* Revenue Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-xl border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Orders Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.orderRevenue || 0)}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${stats.totalRevenue > 0 ? ((stats.orderRevenue / stats.totalRevenue) * 100) : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.totalRevenue > 0 ? ((stats.orderRevenue / stats.totalRevenue) * 100).toFixed(1) : '0.0'}% dari total revenue
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-lg font-bold">{stats.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Paid</p>
                      <p className="text-lg font-bold text-green-600">{stats.paidOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Pending</p>
                      <p className="text-lg font-bold text-amber-600">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Bookings Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.bookingRevenue || 0)}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${stats.totalRevenue > 0 ? ((stats.bookingRevenue / stats.totalRevenue) * 100) : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.totalRevenue > 0 ? ((stats.bookingRevenue / stats.totalRevenue) * 100).toFixed(1) : '0.0'}% dari total revenue
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-lg font-bold">{stats.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Confirmed</p>
                      <p className="text-lg font-bold text-green-600">{stats.paidBookings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Pending</p>
                      <p className="text-lg font-bold text-amber-600">{stats.pendingBookings}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Transactions */}
          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top 5 Transaksi (Berdasarkan SAW Score)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tidak ada data transaksi</p>
                  </div>
                ) : (
                  topTransactions.map((transaction, index) => (
                    <div
                      key={`${transaction.type}-${transaction.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border-2 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
                          'bg-gradient-to-br from-blue-400 to-blue-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{transaction.customerName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Badge variant={transaction.type === 'order' ? 'default' : 'secondary'}>
                              {transaction.type === 'order' ? 'Order' : 'Booking'}
                            </Badge>
                            <span>{formatCurrency(transaction.amount || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">SAW Score</p>
                        <p className="text-xl font-bold text-purple-600">
                          {(transaction.finalScore || 0).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              subtitle="Semua pesanan"
              icon={ShoppingCart}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Revenue Orders"
              value={formatCurrency(stats.orderRevenue || 0)}
              subtitle={`${stats.totalRevenue > 0 ? ((stats.orderRevenue / stats.totalRevenue) * 100).toFixed(1) : '0.0'}% dari total`}
              icon={DollarSign}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            <StatCard
              title="Conversion Rate"
              value={`${stats.orderConversionRate.toFixed(1)}%`}
              subtitle={`${stats.paidOrders} dari ${stats.totalOrders} paid`}
              icon={TrendingUp}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
          </div>

          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle>Top 3 Orders (SAW Ranking)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tidak ada data orders</p>
                  </div>
                ) : (
                  topOrders.map((order, index) => (
                    <div key={`order-${order.id}`} className="p-6 rounded-2xl border-2 bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold">#{index + 1}</span>
                            <Badge>Order</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{order.customerName}</h3>
                          <p className="text-sm text-gray-600">Order ID: {order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">SAW Score</p>
                          <p className="text-3xl font-bold text-green-600">{(order.finalScore || 0).toFixed(4)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-600">Amount</p>
                          <p className="font-bold">{formatCurrency(order.amount || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Status</p>
                          <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Payment Proof</p>
                          <p className="font-bold">{order.hasPaymentProof ? '✅ Yes' : '❌ No'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              subtitle="Semua booking"
              icon={Calendar}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              title="Revenue Bookings"
              value={formatCurrency(stats.bookingRevenue || 0)}
              subtitle={`${stats.totalRevenue > 0 ? ((stats.bookingRevenue / stats.totalRevenue) * 100).toFixed(1) : '0.0'}% dari total`}
              icon={DollarSign}
              color="bg-gradient-to-br from-cyan-500 to-cyan-600"
            />
            <StatCard
              title="Conversion Rate"
              value={`${stats.bookingConversionRate.toFixed(1)}%`}
              subtitle={`${stats.paidBookings} dari ${stats.totalBookings} confirmed`}
              icon={TrendingUp}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>

          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle>Top 3 Bookings (SAW Ranking)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tidak ada data bookings</p>
                  </div>
                ) : (
                  topBookings.map((booking, index) => (
                    <div key={`booking-${booking.id}`} className="p-6 rounded-2xl border-2 bg-gradient-to-r from-blue-50 to-cyan-50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold">#{index + 1}</span>
                            <Badge variant="secondary">Booking</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{booking.customerName}</h3>
                          <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">SAW Score</p>
                          <p className="text-3xl font-bold text-blue-600">{(booking.finalScore || 0).toFixed(4)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-600">Amount</p>
                          <p className="font-bold">{formatCurrency(booking.amount || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Status</p>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Payment Proof</p>
                          <p className="font-bold">{booking.hasPaymentProof ? '✅ Yes' : '❌ No'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranking SAW Tab */}
        <TabsContent value="ranking" className="space-y-6">
          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Complete SAW Ranking (All Transactions)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sawAnalysis.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Tidak ada data untuk ranking</p>
                  </div>
                ) : (
                  sawAnalysis.map((transaction) => (
                    <div
                      key={`${transaction.type}-${transaction.id}`}
                      className="p-4 rounded-xl border-2 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                            transaction.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                            transaction.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                            transaction.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
                            'bg-gradient-to-br from-blue-400 to-blue-500'
                          }`}>
                            #{transaction.rank}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900">{transaction.customerName}</p>
                              <Badge variant={transaction.type === 'order' ? 'default' : 'secondary'}>
                                {transaction.type === 'order' ? 'Order' : 'Booking'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{formatCurrency(transaction.amount || 0)}</span>
                              <span>•</span>
                              <span>{transaction.status}</span>
                              <span>•</span>
                              <span>{transaction.hasPaymentProof ? '✅ Paid' : '⏳ Pending'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">SAW Score</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {(transaction.finalScore || 0).toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
