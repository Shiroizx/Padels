import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd MMMM yyyy', { locale: id })
}

export function formatTime(time: string): string {
  return time.substring(0, 5) // HH:mm
}

export function formatDateTime(datetime: string): string {
  return format(parseISO(datetime), 'dd MMM yyyy HH:mm', { locale: id })
}
