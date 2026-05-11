import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { ProductCard } from '@/components/products/product-card'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Produk Olahraga</h1>
          <p className="text-gray-600">Belanja perlengkapan olahraga berkualitas</p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer">
              Semua
            </Badge>
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="cursor-pointer">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            Error loading products: {error.message}
          </div>
        )}

        {!products || products.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <p className="text-gray-500">Belum ada produk tersedia</p>
            <p className="mt-2 text-sm text-gray-400">
              Silakan hubungi admin untuk menambahkan produk
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
