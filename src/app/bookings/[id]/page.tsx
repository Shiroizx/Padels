import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { BookingDetailClient } from '@/components/bookings/booking-detail-client'
import { redirect, notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookingDetailPage({ params }: PageProps) {
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

  // Get booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, court:courts(*)')
    .eq('id', id)
    .single()

  if (error || !booking) {
    notFound()
  }

  // Check authorization
  if (booking.user_id !== user.id && user.role !== 'admin') {
    redirect('/bookings')
  }

  // Get payment proof URL if exists
  let paymentProofUrl: string | null = null
  if (booking.payment_proof) {
    const { data: signedData } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(booking.payment_proof, 3600)
    
    paymentProofUrl = signedData?.signedUrl || null
  }

  // Get all bookings for the same court and date to show schedule
  const { data: courtSchedule } = await supabase
    .from('bookings')
    .select('id, start_time, end_time, status, booking_name, hide_name')
    .eq('court_id', booking.court_id)
    .eq('booking_date', booking.booking_date)
    .in('status', ['pending', 'confirmed'])
    .order('start_time', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Navbar user={user} />
      <BookingDetailClient 
        booking={booking}
        courtSchedule={courtSchedule || []}
        paymentProofUrl={paymentProofUrl}
      />
    </div>
  )
}
