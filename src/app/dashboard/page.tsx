import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, ShoppingBag, History, Package } from 'lucide-react'

export default async function DashboardPage() {
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

  // Get user stats
  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user.name}!</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingsCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Order</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ordersCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/courts">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <Calendar className="mb-2 h-10 w-10 text-green-600" />
                <CardTitle>Booking Lapangan</CardTitle>
                <CardDescription>Lihat dan booking lapangan</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Lihat Lapangan</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/bookings">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <History className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>History Booking</CardTitle>
                <CardDescription>Lihat riwayat booking Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Lihat History</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <ShoppingBag className="mb-2 h-10 w-10 text-orange-600" />
                <CardTitle>Belanja Produk</CardTitle>
                <CardDescription>Lihat produk olahraga</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Lihat Produk</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <Package className="mb-2 h-10 w-10 text-purple-600" />
                <CardTitle>History Order</CardTitle>
                <CardDescription>Lihat riwayat order Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Lihat History</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
