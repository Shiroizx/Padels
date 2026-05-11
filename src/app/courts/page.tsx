import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { CourtCard } from '@/components/courts/court-card'
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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Daftar Lapangan</h1>
          <p className="text-gray-600">Pilih lapangan untuk booking</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            Error loading courts: {error.message}
          </div>
        )}

        {!courts || courts.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <p className="text-gray-500">Belum ada lapangan tersedia</p>
            <p className="mt-2 text-sm text-gray-400">
              Silakan hubungi admin untuk menambahkan lapangan
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
