import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { DeleteCourtButton } from '@/components/admin/delete-court-button'
import { CourtImage } from '@/components/shared/court-image'
import { formatCurrency } from '@/lib/utils/currency'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DeleteCourtPage({ params }: PageProps) {
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

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get court data
  const { data: court, error } = await supabase
    .from('courts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !court) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/admin/courts">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Lapangan
          </Button>
        </Link>

        <h1 className="mb-6 text-3xl font-bold text-red-600">Hapus Lapangan</h1>

        <div className="max-w-2xl">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Konfirmasi Penghapusan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  ⚠️ <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. 
                  Lapangan akan dihapus secara permanen dari database.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Detail Lapangan yang akan dihapus:</h3>
                
                <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-200">
                  <CourtImage
                    image={court.image || court.images}
                    alt={court.name}
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <p><strong>Nama:</strong> {court.name}</p>
                  {court.location && <p><strong>Lokasi:</strong> {court.location}</p>}
                  <p><strong>Harga:</strong> {formatCurrency(court.price_per_hour)}/jam</p>
                  {court.description && <p><strong>Deskripsi:</strong> {court.description}</p>}
                </div>
              </div>

              <div className="flex gap-4 border-t pt-6">
                <Link href="/admin/courts" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
                <DeleteCourtButton courtId={court.id} courtName={court.name} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
