import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Package } from 'lucide-react'
import { ProductImage } from '@/components/shared/product-image'

export default async function AdminProductsPage() {
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

  // Get all products
  const { data: products } = await supabase
    .from('products')
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
            <h1 className="text-3xl font-bold">Kelola Produk</h1>
            <p className="text-gray-600">Tambah, edit, atau hapus produk</p>
          </div>
          <Link href="/admin/products/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold text-gray-600">
                Belum Ada Produk
              </h2>
              <p className="mb-6 text-gray-500">
                Tambahkan produk pertama Anda
              </p>
              <Link href="/admin/products/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Produk
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <Card key={product.id}>
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-200">
                    <ProductImage
                      image={product.image}
                      alt={product.name}
                      className="object-cover"
                      priority={index < 4}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                    {product.is_available && product.stock > 0 ? (
                      <Badge className="bg-green-600 ml-2">Tersedia</Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-2">Habis</Badge>
                    )}
                  </div>
                  
                  {product.category && (
                    <p className="mb-2 text-sm text-gray-600">{product.category}</p>
                  )}
                  
                  <p className="mb-2 text-lg font-bold text-green-600">
                    {formatCurrency(product.price)}
                  </p>

                  <p className="mb-4 text-sm text-gray-600">
                    Stok: <strong>{product.stock}</strong> unit
                  </p>

                  <div className="flex gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/products/${product.id}/delete`} className="flex-1">
                      <Button variant="destructive" className="w-full" size="sm">
                        <Trash2 className="mr-1 h-3 w-3" />
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
