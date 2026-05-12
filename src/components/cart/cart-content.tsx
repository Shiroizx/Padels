'use client'

import { useCartStore } from '@/lib/store/cart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils/currency'
import { ProductImage } from '@/components/shared/product-image'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function CartContent() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, getTotalPrice, getItemCount } = useCartStore()

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-600">
            Keranjang Anda Kosong
          </h2>
          <p className="mb-6 text-gray-500">
            Belum ada produk di keranjang belanja Anda
          </p>
          <Link href="/products">
            <Button>Belanja Sekarang</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Produk ({getItemCount()} item)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 border-b pb-4 last:border-b-0"
              >
                {/* Product Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                  <ProductImage
                    image={item.product.image}
                    alt={item.product.name}
                    className="object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-semibold hover:text-green-600"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.category && (
                      <p className="text-sm text-gray-500">
                        {item.product.category}
                      </p>
                    )}
                    <p className="mt-1 font-semibold text-green-600">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value)
                          if (val >= 1 && val <= item.product.stock) {
                            updateQuantity(item.product.id, val)
                          }
                        }}
                        className="h-8 w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stok: {item.product.stock}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Ringkasan Belanja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({getItemCount()} item)</span>
                <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="text-gray-600">Dihitung di checkout</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push('/checkout')}
            >
              Lanjut ke Checkout
            </Button>

            <Link href="/products">
              <Button variant="outline" className="w-full">
                Lanjut Belanja
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
