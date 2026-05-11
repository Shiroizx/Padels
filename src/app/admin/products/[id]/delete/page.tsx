import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { ProductImage } from '@/components/shared/product-image'
import { formatCurrency } from '@/lib/utils/currency'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DeleteProductPage({ params }: PageProps) {
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

  // Get product data
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/admin/products">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Produk
          </Button>
        </Link>

        <h1 className="mb-6 text-3xl font-bold text-red-600">Hapus Produk</h1>

        <div className="max-w-2xl">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Konfirmasi Penghapusan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  ⚠️ <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. 
                  Produk akan dihapus secara permanen dari database.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Detail Produk yang akan dihapus:</h3>
                
                <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-200">
                  <ProductImage
                    productId={product.id}
                    image={product.image}
                    alt={product.name}
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <p><strong>Nama:</strong> {product.name}</p>
                  {product.category && <p><strong>Kategori:</strong> {product.category}</p>}
                  <p><strong>Harga:</strong> {formatCurrency(product.price)}</p>
                  <p><strong>Stok:</strong> {product.stock} unit</p>
                  {product.description && <p><strong>Deskripsi:</strong> {product.description}</p>}
                </div>
              </div>

              <div className="flex gap-4 border-t pt-6">
                <Link href="/admin/products" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
                <DeleteProductButton productId={product.id} productName={product.name} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
