'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  Shield,
  Award,
  Star,
  Heart,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductImage } from '@/components/shared/product-image'
import { formatCurrency } from '@/lib/utils/currency'
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
  created_at: string
  updated_at: string
}

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [mounted, setMounted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()

  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartQuantity = cartItems.find(i => i.product.id === product.id)?.quantity || 0

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Stok habis', {
        description: 'Produk ini sedang tidak tersedia',
      })
      return
    }

    if (cartQuantity + quantity > product.stock) {
      toast.error('Stok tidak cukup', {
        description: `Hanya tersedia ${product.stock} unit`,
      })
      return
    }

    addItem(product, quantity)
    toast.success('Ditambahkan ke keranjang', {
      description: `${quantity} ${product.name} berhasil ditambahkan`,
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link href="/products">
          <Button variant="ghost" className="group hover:bg-white/80">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Produk
          </Button>
        </Link>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-8 lg:grid-cols-2"
      >
        {/* Left: Image */}
        <motion.div variants={item}>
          <div className="sticky top-6">
            <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-gray-200 shadow-xl">
              <div className="relative h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
                <ProductImage
                  image={product.image}
                  alt={product.name}
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Badges */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                {product.stock > 0 ? (
                  <Badge className="bg-green-500 text-white px-4 py-2 text-sm shadow-lg">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Tersedia
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 text-white px-4 py-2 text-sm shadow-lg">
                    Stok Habis
                  </Badge>
                )}
                {cartQuantity > 0 && (
                  <Badge className="bg-purple-500 text-white px-4 py-2 text-sm shadow-lg">
                    {cartQuantity} di keranjang
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Product Info Card */}
          <motion.div variants={item}>
            <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6 md:p-8">
              {/* Category */}
              {product.category && (
                <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
                  {product.category}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating (placeholder) */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8 dari 127 ulasan)</span>
              </div>

              {/* Price */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white mb-6">
                <div className="text-sm opacity-90 mb-1">Harga</div>
                <div className="text-4xl md:text-5xl font-bold">
                  {formatCurrency(product.price)}
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6 p-4 rounded-xl bg-gray-50">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">
                  Stok tersedia: <strong className="text-purple-600">{product.stock}</strong> unit
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Deskripsi Produk</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Jumlah</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border-2 border-gray-200 bg-white">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-l-xl"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <div className="w-16 text-center font-bold text-lg">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-r-xl"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Subtotal: <span className="font-bold text-purple-600">{formatCurrency(product.price * quantity)}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 rounded-xl border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Tambah ke Keranjang
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  size="lg"
                  className="flex-1 h-14 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold shadow-lg"
                >
                  Beli Sekarang
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-green-900">Produk Original</p>
                    <p className="text-xs text-green-700">100% authentic</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-blue-900">Garansi Resmi</p>
                    <p className="text-xs text-blue-700">Terjamin kualitas</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-purple-900">Pengiriman Cepat</p>
                    <p className="text-xs text-purple-700">1-3 hari kerja</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-orange-900">Bisa COD</p>
                    <p className="text-xs text-orange-700">Bayar di tempat</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div variants={item}>
            <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="font-bold text-orange-900 mb-1">Butuh Bantuan?</h3>
                  <p className="text-sm text-orange-700 mb-3">
                    Tim customer service kami siap membantu Anda 24/7
                  </p>
                  <Button variant="outline" size="sm" className="rounded-lg border-orange-300 hover:bg-orange-100">
                    Hubungi Support
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
