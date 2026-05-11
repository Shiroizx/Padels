import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductImage } from '@/components/shared/product-image'
import { AddToCartButton } from '@/components/products/add-to-cart-button'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Tag } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductDetailPage({ params }: PageProps) {
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

  // Get product details
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
        <Link href="/products">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Produk
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-200">
                  <ProductImage
                    productId={product.id}
                    image={product.image}
                    alt={product.name}
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {product.category && (
                      <Badge variant="secondary" className="mb-2">
                        <Tag className="mr-1 h-3 w-3" />
                        {product.category}
                      </Badge>
                    )}
                    <CardTitle className="text-3xl">{product.name}</CardTitle>
                  </div>
                  {product.is_available && product.stock > 0 ? (
                    <Badge className="bg-green-600">Tersedia</Badge>
                  ) : (
                    <Badge variant="destructive">Stok Habis</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-sm text-gray-600">Harga</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(product.price)}
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-center text-gray-600">
                  <Package className="mr-2 h-5 w-5" />
                  <span>Stok tersedia: <strong>{product.stock}</strong> unit</span>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Deskripsi</h3>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                {/* Add to Cart */}
                <AddToCartButton product={product} />

                <div className="space-y-2 border-t pt-4 text-sm text-gray-600">
                  <p>✓ Produk original</p>
                  <p>✓ Garansi resmi</p>
                  <p>✓ Pengiriman cepat</p>
                  <p>✓ Bisa COD</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
