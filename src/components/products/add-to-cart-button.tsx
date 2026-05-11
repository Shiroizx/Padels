'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (!product.is_available || product.stock <= 0) {
      toast.error('Produk tidak tersedia')
      return
    }

    if (quantity > product.stock) {
      toast.error('Jumlah melebihi stok tersedia')
      return
    }

    addItem(product, quantity)
    toast.success('Produk ditambahkan ke keranjang!', {
      description: `${quantity}x ${product.name}`,
      action: {
        label: 'Lihat Keranjang',
        onClick: () => router.push('/cart'),
      },
    })
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const isDisabled = !product.is_available || product.stock <= 0

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Jumlah</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || isDisabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (val >= 1 && val <= product.stock) {
                setQuantity(val)
              }
            }}
            className="w-20 text-center"
            disabled={isDisabled}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={incrementQuantity}
            disabled={quantity >= product.stock || isDisabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className="w-full"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isDisabled ? 'Stok Habis' : 'Tambah ke Keranjang'}
      </Button>
    </div>
  )
}
