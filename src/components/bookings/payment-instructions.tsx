'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Wallet, QrCode, Banknote, Copy, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'

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
}

interface PaymentInstructionsProps {
  paymentMethod: string // 'transfer', 'e_wallet', 'qris', 'cash'
  paymentMethodId?: number | null // Specific payment method id
}

export function PaymentInstructions({ paymentMethod, paymentMethodId }: PaymentInstructionsProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadPaymentMethods() {
      setIsLoading(true)
      try {
        let data = null
        let error = null

        // If we have a specific payment method id, load only that one
        if (paymentMethodId) {
          const result = await supabase
            .from('payment_methods')
            .select('*')
            .eq('id', paymentMethodId)
            .eq('is_active', true)
            .single()
          
          data = result.data ? [result.data] : []
          error = result.error
        } else {
          // Fallback: load by type (for old orders without payment_method_id)
          let type = paymentMethod
          if (paymentMethod === 'transfer') type = 'bank_transfer'
          if (paymentMethod === 'credit_card') type = 'bank_transfer'

          const result = await supabase
            .from('payment_methods')
            .select('*')
            .eq('type', type)
            .eq('is_active', true)
            .order('display_order', { ascending: true })

          data = result.data
          error = result.error
        }

        if (error) throw error

        setMethods(data || [])

        // Load QR codes for QRIS methods
        if (data) {
          const urls: Record<number, string> = {}
          for (const method of data) {
            if (method.qr_code_image) {
              const { data: signedData } = await supabase.storage
                .from('qr-codes')
                .createSignedUrl(method.qr_code_image, 3600)
              
              if (signedData?.signedUrl) {
                urls[method.id] = signedData.signedUrl
              }
            }
          }
          setQrCodeUrls(urls)
        }
      } catch (error) {
        console.error('Failed to load payment methods:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPaymentMethods()
  }, [paymentMethod, paymentMethodId, supabase])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Berhasil disalin!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return <Building2 className="h-5 w-5" />
      case 'e_wallet':
        return <Wallet className="h-5 w-5" />
      case 'qris':
        return <QrCode className="h-5 w-5" />
      case 'cash':
        return <Banknote className="h-5 w-5" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="mt-4 text-sm text-gray-600">Memuat informasi pembayaran...</p>
        </CardContent>
      </Card>
    )
  }

  if (methods.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-gray-600">
            Metode pembayaran tidak tersedia. Silakan hubungi admin.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!paymentMethodId && methods.length > 1 && (
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            <strong>Pilih salah satu:</strong> Anda bisa transfer ke salah satu rekening di bawah ini.
          </p>
        </div>
      )}
      
      {methods.map((method) => (
        <Card key={method.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                {getIcon(method.type)}
              </div>
              <CardTitle className="text-lg">{method.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank Transfer */}
            {method.type === 'bank_transfer' && (
              <div className="space-y-3">
                {method.bank_name && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Nama Bank</div>
                    <div className="font-semibold text-gray-900">{method.bank_name}</div>
                  </div>
                )}
                
                {method.account_number && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Nomor Rekening</div>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-lg font-semibold text-gray-900">
                        {method.account_number}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(method.account_number!, `account-${method.id}`)}
                      >
                        {copiedField === `account-${method.id}` ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {method.account_name && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-600">Atas Nama</div>
                    <div className="font-semibold text-gray-900">{method.account_name}</div>
                  </div>
                )}
              </div>
            )}

            {/* E-Wallet */}
            {method.type === 'e_wallet' && method.phone_number && (
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-600">Nomor HP</div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-lg font-semibold text-gray-900">
                    {method.phone_number}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(method.phone_number!, `phone-${method.id}`)}
                  >
                    {copiedField === `phone-${method.id}` ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* QRIS */}
            {method.type === 'qris' && qrCodeUrls[method.id] && (
              <div className="flex justify-center">
                <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
                  <div className="relative h-64 w-64">
                    <Image
                      src={qrCodeUrls[method.id]}
                      alt="QR Code"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-gray-600">
                    Scan QR Code untuk pembayaran
                  </p>
                </div>
              </div>
            )}

            {/* Instructions */}
            {method.instructions && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="text-xs font-medium text-blue-900">Instruksi:</div>
                <div className="mt-1 text-sm text-blue-700 whitespace-pre-line">
                  {method.instructions}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
