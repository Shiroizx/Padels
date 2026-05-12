'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/utils/date'
import { isBookingUpcoming } from '@/lib/utils/booking'
import { Bell, Calendar, Clock, MapPin, User, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Booking {
  id: number
  court_name: string
  booking_name: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  hide_name: boolean
  user?: {
    name: string
    email: string
  }
  court?: {
    location?: string
  }
}

export function UpcomingBookingsAdminCard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUpcomingBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, user:users(name, email), court:courts(location)')
          .eq('status', 'confirmed')
          .gte('booking_date', new Date().toISOString().split('T')[0])
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(10)

        if (error) throw error

        // Filter to only show bookings within 24 hours
        const upcoming = (data || []).filter((booking) =>
          isBookingUpcoming(booking.booking_date, booking.start_time, 24)
        )

        setBookings(upcoming)
      } catch (error) {
        console.error('Failed to load upcoming bookings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUpcomingBookings()
  }, [supabase])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Booking Akan Datang (Admin)
          </CardTitle>
          <CardDescription>Semua booking dalam 24 jam ke depan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Booking Akan Datang (Admin)
          </CardTitle>
          <CardDescription>Semua booking dalam 24 jam ke depan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-500">Tidak ada booking dalam 24 jam ke depan</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Booking Akan Datang (Admin)
          <Badge className="bg-blue-600">{bookings.length}</Badge>
        </CardTitle>
        <CardDescription>Semua booking dalam 24 jam ke depan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{booking.court_name}</h4>
                  <p className="text-sm text-gray-600">Booking: {booking.booking_name}</p>
                </div>
                <Badge className="bg-blue-600">Akan Datang</Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center text-sm text-gray-700">
                  <User className="mr-2 h-4 w-4 text-blue-600" />
                  {booking.hide_name ? 'Nama Disembunyikan' : booking.user?.name || 'Unknown'}
                  {!booking.hide_name && booking.user?.email && (
                    <span className="ml-2 text-xs text-gray-500">({booking.user.email})</span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                  {formatDate(booking.booking_date)}
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="mr-2 h-4 w-4 text-blue-600" />
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </div>
                {booking.court?.location && (
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                    {booking.court.location}
                  </div>
                )}
              </div>

              <Link href={`/admin/bookings/${booking.id}`} className="mt-3 block">
                <Button variant="outline" size="sm" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  Lihat Detail
                </Button>
              </Link>
            </div>
          ))}

          {bookings.length > 0 && (
            <Link href="/admin/bookings">
              <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50">
                Lihat Semua Booking
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
