import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { CourtsClient } from '@/components/courts/courts-client'
import { redirect } from 'next/navigation'

export default async function CourtsPage() {
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

  // Get all available courts
  const { data: courts, error } = await supabase
    .from('courts')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Navbar user={user} />
      <CourtsClient courts={courts || []} error={error?.message} />
    </div>
  )
}
