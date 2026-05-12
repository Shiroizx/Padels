import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { redirect, notFound } from 'next/navigation'
import { OrderDetailClient } from '@/components/orders/order-detail-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderDetailPage({ params }: PageProps) {
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

  if (!user) {
    redirect('/login')
  }

  // Get order details with payment info
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        price,
        products (
          id,
          name,
          image,
          category
        )
      ),
      payments (
        id,
        payment_method_id,
        proof_image,
        status
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Get payment method details
  let paymentMethodName = 'Transfer Bank'
  if (order.payments && order.payments.length > 0) {
    const { data: paymentMethod } = await supabase
      .from('payment_methods')
      .select('name')
      .eq('id', order.payments[0].payment_method_id)
      .single()
    
    if (paymentMethod) {
      paymentMethodName = paymentMethod.name
    }
  }

  // Get payment proof URL if exists (using signed URL for private bucket)
  let paymentProofUrl = null
  if (order.payment_proof) {
    // Generate signed URL (valid for 1 hour)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(order.payment_proof, 3600) // 3600 seconds = 1 hour
    
    if (!signedError && signedData) {
      paymentProofUrl = signedData.signedUrl
    }
  }
  
  // Also check payments table for proof_image
  if (!paymentProofUrl && order.payments && order.payments.length > 0 && order.payments[0].proof_image) {
    const { data: signedData, error: signedError } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(order.payments[0].proof_image, 3600)
    
    if (!signedError && signedData) {
      paymentProofUrl = signedData.signedUrl
    }
  }

  // Add payment method name to order object
  const orderWithPaymentMethod = {
    ...order,
    payment_method: paymentMethodName
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <Navbar user={user} />
      <OrderDetailClient order={orderWithPaymentMethod} paymentProofUrl={paymentProofUrl} />
    </div>
  )
}
