import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, MapPin } from 'lucide-react'
import { CourtImage } from '@/components/shared/court-image'

export default async function AdminCourtsPage() {
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

  // Get all courts
  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Kelola Lapangan</h1>
            <p className="text-gray-600">Tambah, edit, atau hapus lapangan</p>
          </div>
          <Link href="/admin/courts/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Lapangan
            </Button>
          </Link>
        </div>

        {!courts || courts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold text-gray-600">
                Belum Ada Lapangan
              </h2>
              <p className="mb-6 text-gray-500">
                Tambahkan lapangan pertama Anda
              </p>
              <Link href="/admin/courts/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Lapangan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <Card key={court.id}>
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-200">
                    <CourtImage
                      courtId={court.id}
                      image={court.image}
                      alt={court.name}
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                    {court.is_available ? (
                      <Badge className="bg-green-600">Tersedia</Badge>
                    ) : (
                      <Badge variant="destructive">Tidak Tersedia</Badge>
                    )}
                  </div>
                  
                  {court.location && (
                    <p className="mb-2 text-sm text-gray-600">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {court.location}
                    </p>
                  )}
                  
                  <p className="mb-4 text-xl font-bold text-green-600">
                    {formatCurrency(court.price_per_hour)}/jam
                  </p>

                  {court.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {court.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/admin/courts/${court.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/courts/${court.id}/delete`} className="flex-1">
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
