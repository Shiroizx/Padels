'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Calendar, AlertCircle } from 'lucide-react'
import { formatTime } from '@/lib/utils/date'

interface CourtScheduleProps {
  courtId: number
  courtName: string
}

interface BookingSlot {
  id: number
  start_time: string
  end_time: string
  status: string
  booking_name: string
  hide_name: boolean
}

export function CourtSchedule({ courtId, courtName }: CourtScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [schedule, setSchedule] = useState<BookingSlot[]>([])
  const [loading, setLoading] = useState(false)

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [])

  // Fetch schedule when date changes
  useEffect(() => {
    if (!selectedDate) return

    const fetchSchedule = async () => {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('bookings')
        .select('id, start_time, end_time, status, booking_name, hide_name')
        .eq('court_id', courtId)
        .eq('booking_date', selectedDate)
        .in('status', ['pending', 'confirmed'])
        .order('start_time', { ascending: true })

      if (!error && data) {
        setSchedule(data)
      } else {
        setSchedule([])
      }
      setLoading(false)
    }

    fetchSchedule()
  }, [selectedDate, courtId])

  // Get available time slots
  const getAvailableSlots = () => {
    const operatingHours = { start: 9, end: 22 } // 09:00 - 22:00
    const bookedSlots = schedule.map((s) => ({
      start: parseInt(s.start_time.split(':')[0]),
      end: parseInt(s.end_time.split(':')[0]),
    }))

    const available: string[] = []
    for (let hour = operatingHours.start; hour < operatingHours.end; hour++) {
      const isBooked = bookedSlots.some(
        (slot) => hour >= slot.start && hour < slot.end
      )
      if (!isBooked) {
        available.push(`${hour.toString().padStart(2, '0')}:00`)
      }
    }
    return available
  }

  const availableSlots = getAvailableSlots()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jadwal Booking</CardTitle>
        <p className="text-sm text-gray-600">
          Lihat jadwal yang sudah terisi untuk {courtName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Picker */}
        <div>
          <Label htmlFor="date">Pilih Tanggal</Label>
          <div className="relative mt-1">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="date"
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
          <div className="text-center text-sm text-gray-500 py-4">
            Memuat jadwal...
          </div>
        )}

        {/* Schedule Display */}
        {!loading && selectedDate && (
          <>
            {/* Booked Slots */}
            {schedule.length > 0 ? (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">
                  Jadwal Terisi ({schedule.length})
                </h4>
                <div className="space-y-2">
                  {schedule.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-red-600" />
                        <div>
                          <div className="font-medium text-red-900">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                          <div className="text-xs text-red-700">
                            {slot.hide_name ? 'Private' : slot.booking_name}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={slot.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {slot.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <p className="font-medium text-green-900">Semua Slot Tersedia!</p>
                <p className="text-sm text-green-700">
                  Belum ada booking untuk tanggal ini
                </p>
              </div>
            )}

            {/* Available Slots Info */}
            {availableSlots.length > 0 && schedule.length > 0 && (
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Slot Tersedia ({availableSlots.length})
                    </p>
                    <p className="mt-1 text-xs text-blue-700">
                      {availableSlots.slice(0, 5).join(', ')}
                      {availableSlots.length > 5 && `, +${availableSlots.length - 5} lainnya`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Operating Hours */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">Jam Operasional</p>
              <p className="text-sm text-gray-700">09:00 - 22:00</p>
              <p className="mt-1 text-xs text-gray-600">
                Booking minimal 1 jam, maksimal 5 jam per booking
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
