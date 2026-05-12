export function isBookingExpired(bookingDate: string, endTime: string): boolean {
  const now = new Date()
  const bookingDateTime = new Date(`${bookingDate}T${endTime}`)
  return now > bookingDateTime
}

export function isBookingUpcoming(bookingDate: string, startTime: string, hoursThreshold: number = 24): boolean {
  const now = new Date()
  const bookingDateTime = new Date(`${bookingDate}T${startTime}`)
  const diffInHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  return diffInHours > 0 && diffInHours <= hoursThreshold
}

export function getBookingStatus(bookingDate: string, startTime: string, endTime: string, status: string) {
  if (status === 'cancelled') {
    return { status: 'cancelled', label: 'Dibatalkan', color: 'red' }
  }

  const isExpired = isBookingExpired(bookingDate, endTime)
  const isUpcoming = isBookingUpcoming(bookingDate, startTime, 24)

  if (isExpired && status === 'pending') {
    return { status: 'expired', label: 'Kadaluarsa', color: 'gray' }
  }

  if (isExpired && status === 'confirmed') {
    return { status: 'completed', label: 'Selesai', color: 'green' }
  }

  if (isUpcoming && status === 'confirmed') {
    return { status: 'upcoming', label: 'Akan Datang', color: 'blue' }
  }

  if (status === 'confirmed') {
    return { status: 'confirmed', label: 'Terkonfirmasi', color: 'green' }
  }

  return { status: 'pending', label: 'Menunggu', color: 'yellow' }
}

export function getTimeSlots() {
  const slots = []
  for (let hour = 9; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
}

export function isTimeSlotBooked(
  slot: string,
  bookings: Array<{ start_time: string; end_time: string; status: string }>
): boolean {
  const slotTime = parseInt(slot.split(':')[0])
  
  return bookings.some((booking) => {
    if (booking.status === 'cancelled') return false
    
    const startHour = parseInt(booking.start_time.split(':')[0])
    const endHour = parseInt(booking.end_time.split(':')[0])
    
    // Check if slot is within booking range
    return slotTime >= startHour && slotTime < endHour
  })
}
