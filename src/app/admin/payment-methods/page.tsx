import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, CreditCard, Building2, Wallet, QrCode, Banknote } from 'lucide-react'

const getPaymentIcon = (type: string) => {
  switch (type) {
    case 'bank_transfer':
      return <Building2 className="h-5 w-5" />
    case 'e_wallet':
      return <Wallet className="h-5 w-5" />
    case 'qris':
      return <QrCode className="h-5 w-5" />
    case 'cash':
      return <Banknote className="h-5 w-5" />
    default:
      return <CreditCard className="h-5 w-5" />
  }
}

const getPaymentTypeLabel = (type: string) => {
  switch (type) {
    case 'bank_transfer':
      return 'Transfer Bank'
    case 'e_wallet':
      return 'E-Wallet'
    case 'qris':
      return 'QRIS'
    case 'cash':
      return 'Cash'
    default:
      return type
  }
}

export default async function AdminPaymentMethodsPage() {
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

  // Get all payment methods
  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .order('display_order', { ascending: true })

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
            <h1 className="text-3xl font-bold">Metode Pembayaran</h1>
            <p className="text-gray-600">Kelola metode pembayaran yang tersedia</p>
          </div>
          <Link href="/admin/payment-methods/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Metode
            </Button>
          </Link>
        </div>

        {!paymentMethods || paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold text-gray-600">
                Belum Ada Metode Pembayaran
              </h2>
              <p className="mb-6 text-gray-500">
                Tambahkan metode pembayaran pertama Anda
              </p>
              <Link href="/admin/payment-methods/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Metode
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                        {getPaymentIcon(method.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{method.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {getPaymentTypeLabel(method.type)}
                        </p>
                      </div>
                    </div>
                    {method.is_active ? (
                      <Badge className="bg-green-600">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {method.type === 'bank_transfer' && (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">Bank:</span> {method.bank_name}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">No. Rekening:</span> {method.account_number}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Atas Nama:</span> {method.account_name}
                      </div>
                    </>
                  )}
                  
                  {method.type === 'e_wallet' && method.phone_number && (
                    <div className="text-sm">
                      <span className="font-medium">No. HP:</span> {method.phone_number}
                    </div>
                  )}
                  
                  {method.type === 'qris' && method.qr_code_image && (
                    <div className="text-sm text-green-600">
                      ✓ QR Code tersedia
                    </div>
                  )}
                  
                  {method.instructions && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Instruksi:</span>
                      <p className="mt-1 line-clamp-2">{method.instructions}</p>
                    </div>
                  )}

                  <div className="flex gap-2 border-t pt-4">
                    <Link href={`/admin/payment-methods/${method.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/payment-methods/${method.id}/delete`} className="flex-1">
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
