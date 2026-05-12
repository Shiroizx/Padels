import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { DeletePaymentMethodButton } from '@/components/admin/delete-payment-method-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DeletePaymentMethodPage({ params }: PageProps) {
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

  const { data: paymentMethod, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !paymentMethod) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link href="/admin/payment-methods">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Metode Pembayaran
          </Button>
        </Link>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Hapus Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. 
                Metode pembayaran akan dihapus secara permanen.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Nama:</strong> {paymentMethod.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tipe:</strong> {paymentMethod.type}
              </p>
              {paymentMethod.bank_name && (
                <p className="text-sm text-gray-600">
                  <strong>Bank:</strong> {paymentMethod.bank_name}
                </p>
              )}
            </div>

            <div className="flex gap-4 border-t pt-4">
              <Link href="/admin/payment-methods" className="flex-1">
                <Button variant="outline" className="w-full">
                  Batal
                </Button>
              </Link>
              <DeletePaymentMethodButton 
                paymentMethodId={paymentMethod.id}
                qrCodeImage={paymentMethod.qr_code_image}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
