'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  Truck,
  Shield,
  Sparkles,
  ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductImage } from '@/components/shared/product-image'
import { formatCurrency } from '@/lib/utils/currency'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'

export function CartClient() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const { items, removeItem, updateQuantity, getTotalPrice, getItemCount } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRemove = (productId: number, productName: string) => {
    removeItem(productId)
    toast.success('Dihapus dari keranjang', {
      description: `${productName} telah dihapus`,
    })
  }

  const handleUpdateQuantity = (productId: number, newQuantity: number, stock: number) => {
    if (newQuantity > stock) {
      toast.error('Stok tidak cukup', {
        description: `Hanya tersedia ${stock} unit`,
      })
      return
    }
    updateQuantity(productId, newQuantity)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!mounted) return null

  // Empty State
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-3xl bg-white border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="inline-flex p-6 rounded-full bg-purple-100 mb-6">
              <ShoppingBag className="h-16 w-16 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Keranjang Anda Kosong
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Belum ada produk di keranjang belanja Anda. Yuk mulai belanja!
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 px-8 rounded-xl font-bold shadow-lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Belanja Sekarang
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 md:p-12 text-white shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-3"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Keranjang Belanja</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-5xl font-bold mb-3"
            >
              Keranjang Anda 🛒
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl opacity-90"
            >
              {getItemCount()} produk siap untuk checkout
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 lg:grid-cols-3"
      >
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((cartItem, index) => (
              <motion.div
                key={cartItem.product.id}
                variants={item}
                layout
                exit={{ opacity: 0, scale: 0.95, x: -100 }}
                className="group"
              >
                <div className="rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link href={`/products/${cartItem.product.id}`}>
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform">
                        <ProductImage
                          image={cartItem.product.image}
                          alt={cartItem.product.name}
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${cartItem.product.id}`}
                          className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors mb-2 block"
                        >
                          {cartItem.product.name}
                        </Link>
                        {cartItem.product.category && (
                          <p className="text-sm text-gray-500 mb-2">
                            {cartItem.product.category}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>Stok: {cartItem.product.stock}</span>
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-xl border-2 border-gray-200 bg-white">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-l-xl"
                            onClick={() => handleUpdateQuantity(cartItem.product.id, cartItem.quantity - 1, cartItem.product.stock)}
                            disabled={cartItem.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={cartItem.product.stock}
                            value={cartItem.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value)
                              if (val >= 1) {
                                handleUpdateQuantity(cartItem.product.id, val, cartItem.product.stock)
                              }
                            }}
                            className="h-10 w-16 text-center border-0 focus-visible:ring-0 font-bold"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-r-xl"
                            onClick={() => handleUpdateQuantity(cartItem.product.id, cartItem.quantity + 1, cartItem.product.stock)}
                            disabled={cartItem.quantity >= cartItem.product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Subtotal</div>
                            <div className="text-2xl font-bold text-purple-600">
                              {formatCurrency(cartItem.product.price * cartItem.quantity)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl"
                            onClick={() => handleRemove(cartItem.product.id, cartItem.product.name)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <motion.div variants={item} className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Summary Card */}
            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getItemCount()} item)</span>
                  <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkos Kirim</span>
                  <span className="text-sm">Dihitung di checkout</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-purple-600">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all mb-3"
                onClick={() => router.push('/checkout')}
              >
                Lanjut ke Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full h-12 rounded-xl border-2">
                  Lanjut Belanja
                </Button>
              </Link>
            </div>

            {/* Benefits */}
            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6">
              <h3 className="font-bold text-lg mb-4">Keuntungan Belanja</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Pembayaran Aman</p>
                    <p className="text-xs text-gray-600">Transaksi terjamin aman</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Pengiriman Cepat</p>
                    <p className="text-xs text-gray-600">1-3 hari kerja</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Produk Original</p>
                    <p className="text-xs text-gray-600">100% authentic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
