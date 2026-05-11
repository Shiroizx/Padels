import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { CourtImage } from '@/components/shared/court-image'
import { CourtSchedule } from '@/components/courts/court-schedule'
import { MapPin, Clock, CheckCircle, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CourtDetailPage({ params }: PageProps) {
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

  if (!user) {
    redirect('/login')
  }

  // Get court details
  const { data: court, error } = await supabase
    .from('courts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !court) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/courts">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Lapangan
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Court Image & Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{court.name}</CardTitle>
                    {court.location && (
                      <div className="mt-2 flex items-center text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        {court.location}
                      </div>
                    )}
                  </div>
                  {court.is_available ? (
                    <Badge className="bg-green-600">Tersedia</Badge>
                  ) : (
                    <Badge variant="destructive">Tidak Tersedia</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Image */}
                <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-200">
                  <CourtImage
                    courtId={court.id}
                    image={court.image}
                    alt={court.name}
                    className="object-cover"
                  />
                </div>

                {/* Description */}
                {court.description && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Deskripsi</h3>
                    <p className="text-gray-600">{court.description}</p>
                  </div>
                )}

                {/* Facilities */}
                {court.facilities && court.facilities.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Fasilitas</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {court.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          <span>{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Court Schedule */}
            <CourtSchedule courtId={court.id} courtName={court.name} />
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Lapangan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-2 h-4 w-4" />
                    Harga per jam
                  </div>
                  <div className="mt-1 text-3xl font-bold text-green-600">
                    {formatCurrency(court.price_per_hour)}
                  </div>
                </div>

                {court.is_available ? (
                  <Link href={`/bookings/new?court_id=${court.id}`} className="block">
                    <Button className="w-full" size="lg">
                      Booking Sekarang
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full" size="lg" disabled>
                    Tidak Tersedia
                  </Button>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Konfirmasi instan</p>
                  <p>✓ Berbagai metode pembayaran</p>
                  <p>✓ Bisa reschedule</p>
                  <p>✓ Customer support 24/7</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
