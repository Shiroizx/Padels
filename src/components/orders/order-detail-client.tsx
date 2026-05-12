'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  CreditCard,
  Package,
  Calendar,
  Sparkles,
  Download,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductImage } from '@/components/shared/product-image'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  image: string
  category: string
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  products?: Product | null
}

interface Order {
  id: string
  created_at: string
  status: string
  total_amount: number
  customer_name: string
  customer_phone: string
  customer_address: string
  notes?: string
  payment_method: string
  payment_proof?: string
  order_items?: OrderItem[]
}

interface OrderDetailClientProps {
  order: Order
  paymentProofUrl?: string | null
}

export function OrderDetailClient({ order, paymentProofUrl }: OrderDetailClientProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        label: 'Menunggu Pembayaran', 
        icon: Clock,
        gradient: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200'
      },
      paid: { 
        label: 'Dibayar', 
        icon: CheckCircle2,
        gradient: 'from-green-500 to-emerald-500',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      },
      processing: { 
        label: 'Diproses', 
        icon: Package,
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      shipped: { 
        label: 'Dikirim', 
        icon: Truck,
        gradient: 'from-purple-500 to-pink-500',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200'
      },
      delivered: { 
        label: 'Selesai', 
        icon: CheckCircle2,
        gradient: 'from-green-600 to-teal-600',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      },
      cancelled: { 
        label: 'Dibatalkan', 
        icon: XCircle,
        gradient: 'from-red-500 to-rose-500',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon
  
  const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order #${order.id}`,
        text: `Lihat detail pesanan saya`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link disalin ke clipboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/orders">
            <Button variant="ghost" className="mb-6 hover:bg-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Pesanan
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 md:p-12 text-white shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2 mb-3"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-medium opacity-90">Detail Pesanan</span>
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-5xl font-bold mb-3"
                  >
                    Order #{order.id}
                  </motion.h1>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 text-white/80"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(order.created_at)}</span>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-3"
                >
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${statusConfig.bg} ${statusConfig.border} border-2 backdrop-blur-sm`}>
                    <StatusIcon className={`h-5 w-5 ${statusConfig.text}`} />
                    <span className={`font-bold ${statusConfig.text}`}>{statusConfig.label}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Produk Pesanan</h2>
                  <p className="text-sm text-gray-600">{itemCount} item</p>
                </div>
              </div>

              <div className="space-y-4">
                {order.order_items?.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <Link href={`/products/${item.products?.id}`} className="flex-shrink-0">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 group">
                        <ProductImage
                          image={item.products?.image}
                          alt={item.products?.name || 'Produk'}
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                    </Link>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.products?.id}`}
                          className="font-bold text-lg text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {item.products?.name || 'Produk'}
                        </Link>
                        {item.products?.category && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.products.category}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          {item.quantity}x {formatCurrency(item.price)}
                        </span>
                        <span className="text-lg font-bold text-purple-600">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Informasi Pengiriman</h2>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nama Penerima</p>
                    <p className="font-bold text-gray-900">{order.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nomor Telepon</p>
                    <p className="font-bold text-gray-900">{order.customer_phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Alamat Pengiriman</p>
                    <p className="font-bold text-gray-900">{order.customer_address}</p>
                  </div>
                </div>

                {order.notes && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-amber-600 mb-1">Catatan</p>
                      <p className="font-medium text-amber-900">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Ringkasan Pesanan</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkir</span>
                    <span className="text-green-600 font-semibold">GRATIS</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-purple-600">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Payment Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <h3 className="text-xl font-bold text-gray-900">Pembayaran</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50">
                    <p className="text-sm text-gray-600 mb-1">Metode Pembayaran</p>
                    <p className="font-bold text-gray-900">{order.payment_method}</p>
                  </div>

                  {paymentProofUrl && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Bukti Pembayaran:</p>
                      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
                        <img 
                          src={paymentProofUrl} 
                          alt="Bukti Pembayaran" 
                          className="w-full h-auto"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => window.open(paymentProofUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Bukti
                      </Button>
                    </div>
                  )}

                  {order.status === 'pending' && !paymentProofUrl && (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
                      <p className="text-sm font-semibold text-amber-900 mb-2">
                        Menunggu Pembayaran
                      </p>
                      <p className="text-sm text-amber-700">
                        Silakan upload bukti pembayaran untuk memproses pesanan
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Help Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border-2 border-blue-200 p-6"
              >
                <h3 className="font-bold text-gray-900 mb-2">Butuh Bantuan?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Hubungi customer service kami untuk informasi lebih lanjut
                </p>
                <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Hubungi CS
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
