import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { ProductsClient } from '@/components/products/products-client'
import { redirect } from 'next/navigation'

export default async function ProductsPage() {
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

  // Get all available products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  // Get unique categories
  const categories = products
    ? Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <Navbar user={user} />
      <ProductsClient 
        products={products || []}
        categories={categories}
        error={error?.message}
      />
    </div>
  )
}
