'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { ShoppingCart, Package } from 'lucide-react'
import { ProductImage } from '@/components/shared/product-image'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  category?: string
  image?: string
  is_available: boolean
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Stok habis', {
        description: 'Produk ini sedang tidak tersedia',
      })
      return
    }

    // Create a product object that matches the Product type from types/index.ts
    const productForCart = {
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addItem(productForCart, 1)
    toast.success('Ditambahkan ke keranjang', {
      description: `${product.name} berhasil ditambahkan`,
    })
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full bg-gray-200">
          <ProductImage
            image={product.image}
            alt={product.name}
            className="object-cover"
          />
          {product.is_available && product.stock > 0 ? (
            <Badge className="absolute right-2 top-2 bg-green-600">
              Tersedia
            </Badge>
          ) : (
            <Badge className="absolute right-2 top-2 bg-red-600">
              Stok Habis
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {product.category && (
          <Badge variant="secondary" className="mb-2 text-xs">
            {product.category}
          </Badge>
        )}
        
        <h3 className="mb-2 font-semibold">{product.name}</h3>
        
        {product.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {product.description}
          </p>
        )}

        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(product.price)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Package className="mr-1 h-4 w-4" />
            Stok: {product.stock}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4 pt-0">
        <Link href={`/products/${product.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            Detail
          </Button>
        </Link>
        <Button
          onClick={handleAddToCart}
          disabled={!product.is_available || product.stock <= 0}
          className="flex-1"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Keranjang
        </Button>
      </CardFooter>
    </Card>
  )
}
