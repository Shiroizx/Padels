import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { redirect } from 'next/navigation'
import { SPKClient } from '@/components/admin/spk-client'

export default async function SPKPage() {
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

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get orders data
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        price
      )
    `)
    .order('created_at', { ascending: false })

  // Get bookings data
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      courts (
        id,
        name,
        price_per_hour
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navbar user={user} />
      <SPKClient orders={orders || []} bookings={bookings || []} />
    </div>
  )
}
