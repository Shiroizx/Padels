'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Check,
  Package,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Lock,
  Sparkles,
  Building2,
  Home,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ProductImage } from '@/components/shared/product-image'
import { formatCurrency } from '@/lib/utils/currency'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface PaymentMethod {
  id: number
  name: string
  type: string
  account_number?: string
  account_name?: string
  bank_name?: string
  qr_code_image?: string
  phone_number?: string
  instructions?: string
  is_active: boolean
}

interface CheckoutClientProps {
  userId: string
  userEmail: string
  userName: string
  paymentMethods: PaymentMethod[]
}

type Step = 'shipping' | 'payment' | 'review'

export function CheckoutClient({ userId, userEmail, userName, paymentMethods }: CheckoutClientProps) {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState<Step>('shipping')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [shippingData, setShippingData] = useState({
    fullName: userName || '',
    email: userEmail || '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  })

  const [paymentData, setPaymentData] = useState({
    methodId: paymentMethods[0]?.id || 0,
    proofImage: null as File | null
  })

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const steps = [
    { id: 'shipping', label: 'Pengiriman', icon: MapPin },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard },
    { id: 'review', label: 'Review', icon: FileText }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleNext = () => {
    if (currentStep === 'shipping') {
      // Validate shipping data
      if (!shippingData.fullName || !shippingData.phone || !shippingData.address || !shippingData.city) {
        toast.error('Lengkapi data pengiriman')
        return
      }
      setCurrentStep('payment')
    } else if (currentStep === 'payment') {
      setCurrentStep('review')
    }
  }

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping')
    } else if (currentStep === 'review') {
      setCurrentStep('payment')
    }
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Upload payment proof if exists
      let proofImageFileName = null
      if (paymentData.proofImage) {
        const fileExt = paymentData.proofImage.name.split('.').pop()
        const fileName = `order-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentData.proofImage)

        if (uploadError) throw uploadError

        proofImageFileName = fileName
      }

      // Get selected payment method details
      const selectedMethod = paymentMethods.find(pm => pm.id === paymentData.methodId)
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: getTotalPrice(),
          status: 'pending',
          customer_address: `${shippingData.address}, ${shippingData.city}, ${shippingData.province} ${shippingData.postalCode}`,
          customer_name: shippingData.fullName,
          customer_phone: shippingData.phone,
          payment_method: selectedMethod?.type || 'transfer',
          payment_method_id: paymentData.methodId,
          payment_proof: proofImageFileName,
          notes: shippingData.notes
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // TODO: Create payment record when payments table is ready
      // const { error: paymentError } = await supabase
      //   .from('payments')
      //   .insert({
      //     order_id: order.id,
      //     payment_method_id: paymentData.methodId,
      //     amount: getTotalPrice(),
      //     status: 'pending',
      //     proof_image: proofImageFileName
      //   })
      // if (paymentError) throw paymentError

      // Clear cart
      clearCart()

      // Redirect to success page
      toast.success('Pesanan berhasil dibuat!')
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Gagal membuat pesanan')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === paymentData.methodId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Checkout Aman</h1>
              <p className="text-gray-600">Selesaikan pesanan Anda dengan mudah</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = currentStepIndex >= index
                const isCurrent = currentStep === step.id
                const Icon = step.icon

                return (
                  <div key={step.id} className="flex-1 relative">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isCurrent ? 1.1 : 1,
                          backgroundColor: isActive ? '#3b82f6' : '#e5e7eb'
                        }}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative z-10 ${
                          isActive ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {isActive && currentStepIndex > index ? (
                          <Check className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </motion.div>
                      <span className={`mt-2 text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="absolute top-7 left-1/2 w-full h-1 -z-0">
                        <motion.div
                          initial={false}
                          animate={{
                            scaleX: currentStepIndex > index ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-blue-500 origin-left"
                          style={{ transformOrigin: 'left' }}
                        />
                        <div className="absolute inset-0 bg-gray-200" style={{ zIndex: -1 }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Informasi Pengiriman</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          Nama Lengkap
                        </Label>
                        <Input
                          id="fullName"
                          value={shippingData.fullName}
                          onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                          placeholder="Masukkan nama lengkap"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingData.email}
                          onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        Nomor Telepon
                      </Label>
                      <Input
                        id="phone"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        Alamat Lengkap
                      </Label>
                      <Textarea
                        id="address"
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                        placeholder="Jalan, nomor rumah, RT/RW"
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          Kota
                        </Label>
                        <Input
                          id="city"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                          placeholder="Nama kota"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="province">Provinsi</Label>
                        <Input
                          id="province"
                          value={shippingData.province}
                          onChange={(e) => setShippingData({ ...shippingData, province: e.target.value })}
                          placeholder="Nama provinsi"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Kode Pos</Label>
                        <Input
                          id="postalCode"
                          value={shippingData.postalCode}
                          onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                          placeholder="12345"
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan (Opsional)</Label>
                      <Textarea
                        id="notes"
                        value={shippingData.notes}
                        onChange={(e) => setShippingData({ ...shippingData, notes: e.target.value })}
                        placeholder="Catatan untuk kurir atau penjual"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Metode Pembayaran</h2>
                  </div>

                  <RadioGroup
                    value={paymentData.methodId.toString()}
                    onValueChange={(value) => setPaymentData({ ...paymentData, methodId: parseInt(value) })}
                    className="space-y-4"
                  >
                    {paymentMethods.map((method) => (
                      <Label
                        key={method.id}
                        htmlFor={`payment-${method.id}`}
                        className="flex items-start gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                      >
                        <RadioGroupItem value={method.id.toString()} id={`payment-${method.id}`} className="mt-1" />
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-900 mb-1">{method.name}</div>
                          
                          {/* Bank Transfer Info */}
                          {method.type === 'bank_transfer' && method.account_number && (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-600">
                                <span className="font-semibold">{method.bank_name}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {method.account_number} - {method.account_name}
                              </div>
                            </div>
                          )}
                          
                          {/* E-Wallet Info */}
                          {method.type === 'e_wallet' && method.phone_number && (
                            <div className="text-sm text-gray-600">
                              Nomor: {method.phone_number}
                            </div>
                          )}
                          
                          {/* Instructions */}
                          {method.instructions && (
                            <div className="text-sm text-gray-500 mt-2">{method.instructions}</div>
                          )}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  {selectedPaymentMethod && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 space-y-6"
                    >
                      {/* QR Code Display */}
                      {(selectedPaymentMethod.type === 'qris' || selectedPaymentMethod.type === 'e_wallet') && selectedPaymentMethod.qr_code_image && (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                          <div className="flex flex-col items-center">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Scan QR Code</h3>
                            <div className="bg-white p-4 rounded-2xl shadow-lg">
                              <img 
                                src={selectedPaymentMethod.qr_code_image} 
                                alt="QR Code" 
                                className="w-64 h-64 object-contain"
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-4 text-center">
                              Scan QR code di atas menggunakan aplikasi pembayaran Anda
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer Details */}
                      {selectedPaymentMethod.type === 'bank_transfer' && (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                          <h3 className="font-bold text-lg text-gray-900 mb-4">Detail Transfer</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                              <span className="text-sm text-gray-600">Bank</span>
                              <span className="font-bold text-gray-900">{selectedPaymentMethod.bank_name}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                              <span className="text-sm text-gray-600">Nomor Rekening</span>
                              <span className="font-bold text-gray-900">{selectedPaymentMethod.account_number}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                              <span className="text-sm text-gray-600">Atas Nama</span>
                              <span className="font-bold text-gray-900">{selectedPaymentMethod.account_name}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                              <span className="text-sm text-gray-600">Jumlah Transfer</span>
                              <span className="font-bold text-purple-600 text-lg">{formatCurrency(getTotalPrice())}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* E-Wallet Details */}
                      {selectedPaymentMethod.type === 'e_wallet' && selectedPaymentMethod.phone_number && !selectedPaymentMethod.qr_code_image && (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                          <h3 className="font-bold text-lg text-gray-900 mb-4">Detail E-Wallet</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                              <span className="text-sm text-gray-600">Nomor {selectedPaymentMethod.name}</span>
                              <span className="font-bold text-gray-900">{selectedPaymentMethod.phone_number}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                              <span className="text-sm text-gray-600">Jumlah Transfer</span>
                              <span className="font-bold text-purple-600 text-lg">{formatCurrency(getTotalPrice())}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upload Proof Section */}
                      <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-bold text-amber-900 mb-2">Upload Bukti Pembayaran</h3>
                            <p className="text-sm text-amber-800 mb-4">
                              {selectedPaymentMethod.type === 'bank_transfer' && 'Silakan transfer ke rekening di atas dan upload bukti pembayaran Anda'}
                              {selectedPaymentMethod.type === 'qris' && 'Setelah scan QR code, upload screenshot bukti pembayaran'}
                              {selectedPaymentMethod.type === 'e_wallet' && 'Setelah transfer, upload screenshot bukti pembayaran'}
                              {selectedPaymentMethod.type === 'cash' && 'Anda akan membayar langsung di tempat'}
                            </p>
                            {selectedPaymentMethod.type !== 'cash' && (
                              <>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      setPaymentData({ ...paymentData, proofImage: file })
                                    }
                                  }}
                                  className="h-12 rounded-xl bg-white"
                                />
                                {paymentData.proofImage && (
                                  <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    File terpilih: {paymentData.proofImage.name}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Shipping Info Review */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Alamat Pengiriman</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep('shipping')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-2 text-gray-700">
                      <p className="font-bold text-lg">{shippingData.fullName}</p>
                      <p>{shippingData.phone}</p>
                      <p>{shippingData.email}</p>
                      <p className="pt-2">
                        {shippingData.address}<br />
                        {shippingData.city}, {shippingData.province} {shippingData.postalCode}
                      </p>
                      {shippingData.notes && (
                        <p className="pt-2 text-sm text-gray-600 italic">Catatan: {shippingData.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Method Review */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Metode Pembayaran</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep('payment')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                    </div>
                    {selectedPaymentMethod && (
                      <div className="space-y-2">
                        <p className="font-bold text-lg">{selectedPaymentMethod.name}</p>
                        {selectedPaymentMethod.account_number && (
                          <p className="text-gray-600">
                            {selectedPaymentMethod.account_number} - {selectedPaymentMethod.account_name}
                          </p>
                        )}
                        {paymentData.proofImage && (
                          <p className="text-sm text-green-600 flex items-center gap-2 pt-2">
                            <Check className="h-4 w-4" />
                            Bukti pembayaran: {paymentData.proofImage.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 mt-6"
            >
              {currentStep !== 'shipping' && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="h-14 px-8 rounded-xl border-2 font-bold"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Kembali
                </Button>
              )}

              {currentStep !== 'review' ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 h-14 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg"
                >
                  Lanjutkan
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="flex-1 h-14 px-8 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Buat Pesanan
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-6 space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Ringkasan Pesanan</h3>
                </div>

                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <ProductImage
                          image={item.product.image}
                          alt={item.product.name}
                          className="object-cover"
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(item.product.price)}</p>
                        <p className="text-sm font-bold text-purple-600 mt-1">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkir</span>
                    <span className="text-sm">Gratis</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">Transaksi Aman</h4>
                    <p className="text-sm text-green-700">
                      Data Anda dilindungi dengan enkripsi SSL 256-bit
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
