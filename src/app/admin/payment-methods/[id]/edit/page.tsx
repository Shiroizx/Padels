import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { PaymentMethodForm } from '@/components/admin/payment-method-form'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPaymentMethodPage({ params }: PageProps) {
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
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/admin/payment-methods">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Metode Pembayaran
          </Button>
        </Link>

        <h1 className="mb-6 text-3xl font-bold">Edit Metode Pembayaran</h1>

        <PaymentMethodForm mode="edit" paymentMethod={paymentMethod} />
      </div>
    </div>
  )
}
