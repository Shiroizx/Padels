import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { redirect } from 'next/navigation'
import { CartContent } from '@/components/cart/cart-content'

export default async function CartPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Keranjang Belanja</h1>
        <CartContent />
      </div>
    </div>
  )
}
