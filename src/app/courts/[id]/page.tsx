import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { CourtDetailClient } from '@/components/courts/court-detail-client'
import { redirect, notFound } from 'next/navigation'

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

  // Get today's bookings for schedule
  const today = new Date().toISOString().split('T')[0]
  const { data: todayBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('court_id', id)
    .eq('booking_date', today)
    .in('status', ['pending', 'confirmed'])
    .order('start_time', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Navbar user={user} />
      <CourtDetailClient 
        court={court} 
        todayBookings={todayBookings || []}
      />
    </div>
  )
}
