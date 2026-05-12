'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, LayoutDashboard } from 'lucide-react'
import { formatTime } from '@/lib/utils/date'

interface Court {
  id: number
  name: string
  location: string | null
  is_available: boolean
}

interface Booking {
  id: number
  court_id: number
  start_time: string
  end_time: string
  status: string
  booking_name: string
}

interface CourtAvailability {
  court: Court
  bookings: Booking[]
  availableSlots: number
  totalSlots: number
  utilizationRate: number
}

export function CourtAvailability() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [availability, setAvailability] = useState<CourtAvailability[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch availability when date changes
  useEffect(() => {
    if (!selectedDate) return

    const fetchAvailability = async () => {
      setLoading(true)
      const supabase = createClient()

      // Get all courts
      const { data: courts, error: courtsError } = await supabase
        .from('courts')
        .select('id, name, location, is_available')
        .order('name', { ascending: true })

      if (courtsError || !courts) {
        setLoading(false)
        return
      }

      // Get all bookings for selected date
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, court_id, start_time, end_time, status, booking_name')
        .eq('booking_date', selectedDate)
        .in('status', ['pending', 'confirmed'])

      if (bookingsError) {
        setLoading(false)
        return
      }

      // Calculate availability for each court
      const courtAvailability: CourtAvailability[] = courts.map((court) => {
        const courtBookings = bookings?.filter((b) => b.court_id === court.id) || []
        
        // Calculate booked hours
        let bookedHours = 0
        courtBookings.forEach((booking) => {
          const start = parseInt(booking.start_time.split(':')[0])
          const end = parseInt(booking.end_time.split(':')[0])
          bookedHours += end - start
        })

        const totalSlots = 13 // 09:00 - 22:00 = 13 hours
        const availableSlots = totalSlots - bookedHours
        const utilizationRate = (bookedHours / totalSlots) * 100

        return {
          court,
          bookings: courtBookings,
          availableSlots,
          totalSlots,
          utilizationRate,
        }
      })

      setAvailability(courtAvailability)
      setLoading(false)
    }

    fetchAvailability()
  }, [selectedDate])

  const getAvailabilityStatus = (rate: number) => {
    if (rate === 0) return { label: 'Kosong', color: 'bg-green-500', icon: CheckCircle }
    if (rate < 50) return { label: 'Tersedia', color: 'bg-blue-500', icon: CheckCircle }
    if (rate < 80) return { label: 'Cukup Ramai', color: 'bg-yellow-500', icon: AlertCircle }
    if (rate < 100) return { label: 'Hampir Penuh', color: 'bg-orange-500', icon: AlertCircle }
    return { label: 'Penuh', color: 'bg-red-500', icon: XCircle }
  }

  const getBookedSlots = (bookings: Booking[]) => {
    return bookings.map((b) => ({
      start: parseInt(b.start_time.split(':')[0]),
      end: parseInt(b.end_time.split(':')[0]),
    }))
  }

  const getAvailableHours = (bookings: Booking[]) => {
    const bookedSlots = getBookedSlots(bookings)
    const available: number[] = []
    
    for (let hour = 9; hour < 22; hour++) {
      const isBooked = bookedSlots.some(
        (slot) => hour >= slot.start && hour < slot.end
      )
      if (!isBooked) {
        available.push(hour)
      }
    }
    
    return available
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5 text-blue-600" />
              Ketersediaan Lapangan
            </CardTitle>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Lihat lapangan mana yang kosong dan sudah di-booking
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Date Picker */}
          <div className="max-w-xs">
            <Label htmlFor="availability-date" className="text-sm font-medium">
              Pilih Tanggal
            </Label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="availability-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="pl-10"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-3 text-sm text-gray-500">Memuat data ketersediaan...</p>
              </div>
            </div>
          )}

          {/* Availability Display */}
          {!loading && availability.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 text-center border border-green-200">
                  <div className="text-xl sm:text-3xl font-bold text-green-700">
                    {availability.filter((a) => a.utilizationRate === 0).length}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-green-600">Kosong</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 text-center border border-yellow-200">
                  <div className="text-xl sm:text-3xl font-bold text-yellow-700">
                    {availability.filter((a) => a.utilizationRate > 0 && a.utilizationRate < 100).length}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-yellow-600">Tersedia</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-3 sm:p-4 text-center border border-red-200">
                  <div className="text-xl sm:text-3xl font-bold text-red-700">
                    {availability.filter((a) => a.utilizationRate === 100).length}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm font-medium text-red-600">Penuh</div>
                </div>
              </div>

              {/* Court List */}
              <div className="space-y-3 sm:space-y-4">
                {availability.map((item) => {
                  const status = getAvailabilityStatus(item.utilizationRate)
                  const StatusIcon = status.icon
                  const availableHours = getAvailableHours(item.bookings)

                  return (
                    <div
                      key={item.court.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Court Header */}
                      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                            {item.court.name}
                          </h4>
                          {item.court.location && (
                            <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                              📍 {item.court.location}
                            </p>
                          )}
                          {!item.court.is_available && (
                            <Badge variant="destructive" className="mt-2 text-xs">
                              Tidak Tersedia
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 self-start">
                          <div className={`rounded-full p-1.5 ${status.color}`}>
                            <StatusIcon className="h-4 w-4 text-white" />
                          </div>
                          <Badge variant="outline" className="text-xs font-medium">
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Utilization Bar */}
                      <div className="mb-3 sm:mb-4">
                        <div className="mb-2 flex items-center justify-between text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Tingkat Penggunaan</span>
                          <span className="font-bold text-gray-900">
                            {Math.round(item.utilizationRate)}%
                          </span>
                        </div>
                        <div className="h-2.5 sm:h-3 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full transition-all duration-500 ${status.color}`}
                            style={{ width: `${item.utilizationRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Booking Details */}
                      {item.bookings.length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-700">
                            Jadwal Terisi ({item.bookings.length}):
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            {item.bookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs sm:text-sm border border-gray-100"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="font-semibold text-gray-900">
                                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                  </span>
                                  <span className="text-gray-500 truncate">• {booking.booking_name}</span>
                                </div>
                                <Badge
                                  variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                  className="text-xs self-start sm:self-center"
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3 sm:p-4 text-center">
                          <CheckCircle className="mx-auto mb-2 h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                          <p className="text-xs sm:text-sm font-medium text-green-900">
                            ✓ Semua slot tersedia (09:00 - 22:00)
                          </p>
                        </div>
                      )}

                      {/* Available Slots */}
                      {availableHours.length > 0 && item.bookings.length > 0 && (
                        <div className="mt-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3">
                          <div className="text-xs sm:text-sm font-semibold text-blue-900">
                            Slot Tersedia ({availableHours.length} jam):
                          </div>
                          <div className="mt-1.5 text-xs sm:text-sm text-blue-700">
                            {availableHours.slice(0, 6).map((h) => `${h.toString().padStart(2, '0')}:00`).join(', ')}
                            {availableHours.length > 6 && (
                              <span className="font-semibold"> +{availableHours.length - 6} lainnya</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && availability.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <LayoutDashboard className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Tidak ada data lapangan</p>
              <p className="mt-1 text-xs text-gray-500">Tambahkan lapangan untuk melihat ketersediaan</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
