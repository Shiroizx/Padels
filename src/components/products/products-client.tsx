'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Search,
  Filter,
  Grid3x3,
  List,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

interface ProductsClientProps {
  products: Product[]
  categories: string[]
  error?: string
}

export function ProductsClient({ products, categories, error }: ProductsClientProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name')

  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort
    if (sortBy === 'price-low') {
      filtered = filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered = filtered.sort((a, b) => b.price - a.price)
    } else {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, sortBy, products])

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Stok habis', {
        description: 'Produk ini sedang tidak tersedia',
      })
      return
    }

    addItem(product, 1)
    toast.success('Ditambahkan ke keranjang', {
      description: `${product.name} berhasil ditambahkan`,
    })
  }

  const getCartQuantity = (productId: number) => {
    const item = cartItems.find(i => i.product.id === productId)
    return item?.quantity || 0
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

  const totalInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0)

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
            <div className="flex items-center justify-between mb-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-3"
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">Toko Olahraga</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl font-bold mb-3"
                >
                  Produk Olahraga 🏆
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl opacity-90"
                >
                  {products.length} produk berkualitas untuk kebutuhan olahraga Anda
                </motion.p>
              </div>

              {totalInCart > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link href="/cart">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold shadow-lg relative">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Keranjang
                      <Badge className="ml-2 bg-purple-600 text-white">{totalInCart}</Badge>
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search, Filter & Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Sort & View */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 h-12 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-purple-500 focus:ring-purple-500 focus:outline-none"
            >
              <option value="name">Urutkan: Nama</option>
              <option value="price-low">Harga: Rendah - Tinggi</option>
              <option value="price-high">Harga: Tinggi - Rendah</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-gray-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
              }`}
            >
              Semua Produk
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Menampilkan <span className="font-semibold text-purple-600">{filteredProducts.length}</span> produk
          </span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Reset filter
            </button>
          )}
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-600 mb-8"
        >
          <p className="font-medium">Error loading products</p>
          <p className="text-sm mt-1">{error}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white border-2 border-dashed border-gray-200 p-12 text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'Tidak ada hasil' : 'Belum ada produk'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? 'Coba kata kunci lain atau reset filter' 
              : 'Silakan hubungi admin untuk menambahkan produk'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }} variant="outline">
              Reset Filter
            </Button>
          )}
        </motion.div>
      )}

      {/* Products Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={item}
                layout
              >
                <ProductCardModern 
                  product={product} 
                  index={index}
                  onAddToCart={handleAddToCart}
                  cartQuantity={getCartQuantity(product.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                variants={item}
                layout
              >
                <ProductCardList 
                  product={product} 
                  index={index}
                  onAddToCart={handleAddToCart}
                  cartQuantity={getCartQuantity(product.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Modern Grid Card
function ProductCardModern({ 
  product, 
  index,
  onAddToCart,
  cartQuantity
}: { 
  product: Product
  index: number
  onAddToCart: (product: Product) => void
  cartQuantity: number
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300"
    >
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <ProductImage
            image={product.image}
            alt={product.name}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={index < 4}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Floating badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {product.stock > 0 ? (
              <div className="px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm text-xs font-semibold text-white shadow-lg">
                Tersedia
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm text-xs font-semibold text-white shadow-lg">
                Stok Habis
              </div>
            )}
            {cartQuantity > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-purple-500/90 backdrop-blur-sm text-xs font-semibold text-white shadow-lg">
                {cartQuantity} di keranjang
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {product.category && (
          <Badge variant="secondary" className="mb-2 text-xs">
            {product.category}
          </Badge>
        )}

        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(product.price)}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Package className="h-4 w-4" />
            <span>{product.stock}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-xl">
              Detail
            </Button>
          </Link>
          <Button
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Beli
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// List View Card
function ProductCardList({ 
  product, 
  index,
  onAddToCart,
  cartQuantity
}: { 
  product: Product
  index: number
  onAddToCart: (product: Product) => void
  cartQuantity: number
}) {
  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        whileHover={{ x: 4 }}
        className="group flex flex-col sm:flex-row gap-6 rounded-2xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 p-6"
      >
        {/* Image */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
          <ProductImage
            image={product.image}
            alt={product.name}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={index < 3}
          />
          {cartQuantity > 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-purple-500 text-white text-xs font-bold">
              {cartQuantity}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {product.category && (
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {product.category}
                  </Badge>
                )}
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                  {product.name}
                </h3>
              </div>
              {product.stock > 0 ? (
                <Badge className="bg-green-500">Tersedia</Badge>
              ) : (
                <Badge variant="destructive">Stok Habis</Badge>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>Stok: {product.stock}</span>
              </div>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(product.price)}
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault()
                onAddToCart(product)
              }}
              disabled={product.stock <= 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Tambah ke Keranjang
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
