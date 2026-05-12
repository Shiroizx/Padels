import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CourtAvailability } from '@/components/admin/court-availability'
import { UpcomingBookingsAdminCard } from '@/components/admin/upcoming-bookings-admin-card'
import Link from 'next/link'
import { Calendar, ShoppingBag, Package, CreditCard, LayoutDashboard, Users, BarChart3 } from 'lucide-react'

export default async function AdminDashboardPage() {
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

  // Get admin stats
  const { count: courtsCount } = await supabase
    .from('courts')
    .select('*', { count: 'exact', head: true })

  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })

  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: pendingBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">Kelola aplikasi Padels dengan mudah</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 sm:mb-8 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Lapangan
              </CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <LayoutDashboard className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{courtsCount || 0}</div>
              <p className="mt-1 text-xs text-gray-500">Total lapangan</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Booking
              </CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{bookingsCount || 0}</div>
              <p className="mt-1 text-xs text-gray-500">
                {pendingBookings || 0} menunggu konfirmasi
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Produk
              </CardTitle>
              <div className="rounded-full bg-orange-100 p-2">
                <ShoppingBag className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{productsCount || 0}</div>
              <p className="mt-1 text-xs text-gray-500">Total produk</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Order
              </CardTitle>
              <div className="rounded-full bg-purple-100 p-2">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{ordersCount || 0}</div>
              <p className="mt-1 text-xs text-gray-500">
                {pendingOrders || 0} menunggu konfirmasi
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Users
              </CardTitle>
              <div className="rounded-full bg-indigo-100 p-2">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{usersCount || 0}</div>
              <p className="mt-1 text-xs text-gray-500">Total users</p>
            </CardContent>
          </Card>
        </div>

        {/* Court Availability */}
        <div className="mb-6 sm:mb-8">
          <CourtAvailability />
        </div>

        {/* Upcoming Bookings Notification */}
        <div className="mb-6 sm:mb-8">
          <UpcomingBookingsAdminCard />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/courts" className="group">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="mb-3 inline-flex rounded-lg bg-green-100 p-3 group-hover:bg-green-200 transition-colors">
                    <LayoutDashboard className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Kelola Lapangan</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Tambah, edit, dan hapus lapangan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Kelola Lapangan
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/bookings" className="group">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Kelola Booking</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Lihat dan kelola semua booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                    Kelola Booking
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/products" className="group">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="mb-3 inline-flex rounded-lg bg-orange-100 p-3 group-hover:bg-orange-200 transition-colors">
                    <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Kelola Produk</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Tambah, edit, dan hapus produk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Kelola Produk
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/orders" className="group">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="mb-3 inline-flex rounded-lg bg-purple-100 p-3 group-hover:bg-purple-200 transition-colors">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Kelola Order</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Lihat dan kelola semua order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                    Kelola Order
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/payments" className="group">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="mb-3 inline-flex rounded-lg bg-red-100 p-3 group-hover:bg-red-200 transition-colors">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Approve Pembayaran</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Verifikasi bukti pembayaran
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Approve Pembayaran
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/payment-methods" className="group">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="mb-3 inline-flex rounded-lg bg-indigo-100 p-3 group-hover:bg-indigo-200 transition-colors">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Metode Pembayaran</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Kelola QRIS, rekening bank, dll
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    Kelola Metode
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users" className="group">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="mb-3 inline-flex rounded-lg bg-teal-100 p-3 group-hover:bg-teal-200 transition-colors">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Kelola User</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Edit user dan reset password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-teal-600 text-teal-600 hover:bg-teal-50">
                    Kelola User
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/spk" className="group">
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-amber-200">
                <CardHeader className="pb-4">
                  <div className="mb-3 inline-flex rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 p-3 group-hover:from-amber-200 group-hover:to-yellow-200 transition-colors">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">Analisis SPK</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Sistem Penunjang Keputusan SAW
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white">
                    Lihat Analisis
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
