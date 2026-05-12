'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Home,
  ShoppingBag,
  Sparkles,
  Clock,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/lib/hooks/use-window-size'

export function CheckoutSuccessClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100
      }
    }
  }

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 rounded-full bg-green-400 -z-10"
              />
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Pesanan Berhasil! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Terima kasih telah berbelanja dengan kami
            </p>
            {orderId && (
              <p className="text-lg text-gray-500">
                Nomor Pesanan: <span className="font-bold text-purple-600">#{orderId}</span>
              </p>
            )}
          </motion.div>

          {/* Info Cards */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Proses Cepat</h3>
              <p className="text-sm text-gray-600">
                Pesanan Anda akan segera diproses setelah pembayaran dikonfirmasi
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Dikemas Aman</h3>
              <p className="text-sm text-gray-600">
                Produk dikemas dengan aman dan dikirim dengan cepat
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Pembayaran Aman</h3>
              <p className="text-sm text-gray-600">
                Transaksi Anda dilindungi dengan sistem keamanan terbaik
              </p>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl border-2 border-purple-200 p-8 mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Langkah Selanjutnya</h2>
            </div>
            <div className="space-y-3 text-left max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Cek Email Anda</p>
                  <p className="text-sm text-gray-600">Kami telah mengirim konfirmasi pesanan ke email Anda</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Lakukan Pembayaran</p>
                  <p className="text-sm text-gray-600">Transfer sesuai nominal dan upload bukti pembayaran</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Tunggu Konfirmasi</p>
                  <p className="text-sm text-gray-600">Admin akan memverifikasi pembayaran Anda (maks. 1x24 jam)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pesanan Dikirim</p>
                  <p className="text-sm text-gray-600">Produk akan segera dikirim ke alamat Anda</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {orderId && (
              <Button
                size="lg"
                onClick={() => router.push(`/orders/${orderId}`)}
                className="h-14 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold shadow-lg text-lg"
              >
                <Package className="mr-2 h-5 w-5" />
                Lihat Detail Pesanan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/products')}
              className="h-14 px-8 rounded-xl border-2 font-bold text-lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Belanja Lagi
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="h-14 px-8 rounded-xl border-2 font-bold text-lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Ke Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
