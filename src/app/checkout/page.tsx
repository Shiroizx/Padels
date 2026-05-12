import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { redirect } from 'next/navigation'
import { CheckoutClient } from '@/components/checkout/checkout-client'

export default async function CheckoutPage() {
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

  // Load payment methods
  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Generate public URLs for QR codes
  const paymentMethodsWithUrls = paymentMethods?.map(method => {
    if (method.qr_code_image) {
      const { data: { publicUrl } } = supabase.storage
        .from('qr-codes')
        .getPublicUrl(method.qr_code_image)
      
      return {
        ...method,
        qr_code_image: publicUrl
      }
    }
    return method
  }) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar user={user} />
      <CheckoutClient 
        userId={user.id} 
        userEmail={user.email} 
        userName={user.name}
        paymentMethods={paymentMethodsWithUrls}
      />
    </div>
  )
}
