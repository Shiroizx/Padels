import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { BookingsHistoryClient } from '@/components/bookings/bookings-history-client'
import { redirect } from 'next/navigation'

export default async function BookingsPage() {
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

  // Get user's bookings
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, court:courts(*)')
    .eq('user_id', user.id)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Navbar user={user} />
      <BookingsHistoryClient 
        bookings={bookings || []}
        error={error?.message}
      />
    </div>
  )
}
