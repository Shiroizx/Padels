'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { getTimeSlots, isTimeSlotBooked } from '@/lib/utils/booking'
import { Loader2, Lock, Clock, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeSlotSelectorProps {
  courtId: number
  selectedDate: string
  selectedStartTime?: string
  selectedEndTime?: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  disabled?: boolean
}

export function TimeSlotSelector({
  courtId,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false,
}: TimeSlotSelectorProps) {
  const [bookings, setBookings] = useState<Array<{ start_time: string; end_time: string; status: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadBookings() {
      if (!selectedDate || !courtId) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('start_time, end_time, status')
          .eq('court_id', courtId)
          .eq('booking_date', selectedDate)
          .in('status', ['pending', 'confirmed'])

        if (error) throw error
        setBookings(data || [])
      } catch (error) {
        console.error('Failed to load bookings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [courtId, selectedDate, supabase])

  const timeSlots = getTimeSlots()

  const isSlotAvailable = (slot: string, type: 'start' | 'end') => {
    if (type === 'start') {
      return !isTimeSlotBooked(slot, bookings)
    } else {
      // For end time, check if any slot between start and end is booked
      if (!selectedStartTime) return true
      
      const startHour = parseInt(selectedStartTime.split(':')[0])
      const endHour = parseInt(slot.split(':')[0])
      
      for (let hour = startHour; hour < endHour; hour++) {
        const checkSlot = `${hour.toString().padStart(2, '0')}:00`
        if (isTimeSlotBooked(checkSlot, bookings)) {
          return false
        }
      }
      return true
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <span className="ml-3 text-base text-gray-600 font-medium">Memuat jadwal tersedia...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Start Time */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-600" />
          <Label htmlFor="start_time" className="text-base font-bold text-gray-900">
            Waktu Mulai <span className="text-red-500">*</span>
          </Label>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {timeSlots.slice(0, -1).map((slot, index) => {
            const isAvailable = isSlotAvailable(slot, 'start')
            const isSelected = selectedStartTime === slot
            
            return (
              <motion.button
                key={slot}
                type="button"
                onClick={() => isAvailable && !disabled && onStartTimeChange(slot)}
                disabled={!isAvailable || disabled}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileHover={isAvailable ? { scale: 1.05 } : {}}
                whileTap={isAvailable ? { scale: 0.95 } : {}}
                className={`
                  relative rounded-xl border-2 p-3 text-sm font-bold transition-all
                  ${isSelected 
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : isAvailable 
                      ? 'border-emerald-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md' 
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {slot}
                {isSelected && (
                  <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-emerald-600 bg-white rounded-full" />
                )}
                {!isAvailable && (
                  <Lock className="absolute -top-1 -right-1 h-3 w-3 text-gray-400" />
                )}
              </motion.button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-600" />
            Dipilih
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white border-2 border-emerald-200" />
            Tersedia
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-100 border-2 border-gray-200" />
            Penuh
          </span>
        </div>
      </div>

      {/* End Time */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-600" />
          <Label htmlFor="end_time" className="text-base font-bold text-gray-900">
            Waktu Selesai <span className="text-red-500">*</span>
          </Label>
        </div>
        {!selectedStartTime ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
            <p className="text-sm text-amber-800 font-medium">
              ⏰ Pilih waktu mulai terlebih dahulu
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {timeSlots.slice(1).map((slot, index) => {
              const slotHour = parseInt(slot.split(':')[0])
              const startHour = selectedStartTime ? parseInt(selectedStartTime.split(':')[0]) : 0
              const isAfterStart = slotHour > startHour
              const isAvailable = isAfterStart && isSlotAvailable(slot, 'end')
              const isSelected = selectedEndTime === slot
              
              return (
                <motion.button
                  key={slot}
                  type="button"
                  onClick={() => isAvailable && !disabled && onEndTimeChange(slot)}
                  disabled={!isAvailable || disabled || !selectedStartTime}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={isAvailable ? { scale: 1.05 } : {}}
                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                  className={`
                    relative rounded-xl border-2 p-3 text-sm font-bold transition-all
                    ${isSelected 
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                      : isAvailable 
                        ? 'border-emerald-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md' 
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {slot}
                  {isSelected && (
                    <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-emerald-600 bg-white rounded-full" />
                  )}
                  {!isAfterStart && selectedStartTime && (
                    <Lock className="absolute -top-1 -right-1 h-3 w-3 text-gray-400" />
                  )}
                </motion.button>
              )
            })}
          </div>
        )}
        <p className="text-sm text-gray-600">
          💡 Jam operasional: <span className="font-semibold">09:00 - 22:00</span>
        </p>
      </div>
    </div>
  )
}
